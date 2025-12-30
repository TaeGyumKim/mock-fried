import { defineNuxtModule, addPlugin, addServerHandler, createResolver, useLogger, addImports, addComponentsDir } from '@nuxt/kit'
import { resolve, normalize } from 'pathe'
import { createRequire } from 'node:module'
import type { MockModuleOptions, OpenApiClientConfig, MockRuntimeConfig } from './types'

export type { MockModuleOptions, OpenApiClientConfig }

/**
 * npm 패키지명과 서브경로 분리
 * @example '@org/pkg/path/to/file.yaml' -> { pkg: '@org/pkg', subpath: 'path/to/file.yaml' }
 * @example 'pkg-name/spec.yaml' -> { pkg: 'pkg-name', subpath: 'spec.yaml' }
 * @example '@org/pkg' -> { pkg: '@org/pkg', subpath: undefined }
 */
function parsePackagePath(specPath: string): { pkg: string, subpath?: string } {
  // @scope/package 형태
  if (specPath.startsWith('@')) {
    const parts = specPath.split('/')
    if (parts.length >= 2) {
      const pkg = `${parts[0]}/${parts[1]}`
      const subpath = parts.slice(2).join('/')
      return { pkg, subpath: subpath || undefined }
    }
  }

  // 일반 package 형태
  const slashIndex = specPath.indexOf('/')
  if (slashIndex > 0) {
    return {
      pkg: specPath.slice(0, slashIndex),
      subpath: specPath.slice(slashIndex + 1),
    }
  }

  return { pkg: specPath }
}

/**
 * npm 패키지에서 스펙 파일 경로 해석
 * @param specPath - 스펙 경로 (상대, 절대, npm 패키지)
 * @param rootDir - 프로젝트 루트 디렉토리
 * @param defaultFiles - 패키지 내에서 찾을 기본 파일명 목록
 */
function resolvePackagePath(
  specPath: string,
  rootDir: string,
  defaultFiles: string[] = [],
): string {
  // 상대 경로 (./ 또는 ../)
  if (specPath.startsWith('./') || specPath.startsWith('../')) {
    return normalize(resolve(rootDir, specPath))
  }

  // 절대 경로
  if (specPath.startsWith('/') || /^[a-z]:/i.test(specPath)) {
    return normalize(specPath)
  }

  // npm 패키지 해석
  try {
    const require = createRequire(rootDir + '/package.json')
    const { pkg, subpath } = parsePackagePath(specPath)

    // 패키지 루트 경로 찾기
    const pkgJsonPath = require.resolve(`${pkg}/package.json`)
    const pkgRoot = resolve(pkgJsonPath, '..')

    // 서브경로가 지정된 경우
    if (subpath) {
      return normalize(resolve(pkgRoot, subpath))
    }

    // 서브경로가 없으면 기본 파일들 검색
    for (const file of defaultFiles) {
      const filePath = resolve(pkgRoot, file)
      // 파일 존재 여부는 런타임에서 체크
      return normalize(filePath)
    }

    // 기본 파일이 없으면 패키지 메인 파일 사용
    const mainPath = require.resolve(pkg)
    return normalize(mainPath)
  }
  catch {
    // require.resolve 실패 시 상대 경로로 폴백
    return normalize(resolve(rootDir, specPath))
  }
}

/**
 * OpenAPI 스펙 경로 해석
 */
function resolveOpenAPIPath(specPath: string, rootDir: string): string {
  return resolvePackagePath(specPath, rootDir, [
    'openapi.yaml',
    'openapi.yml',
    'openapi.json',
    'spec.yaml',
    'spec.yml',
    'spec.json',
    'swagger.yaml',
    'swagger.json',
  ])
}

/**
 * Proto 파일 경로 해석
 */
function resolveProtoPath(specPath: string, rootDir: string): string {
  return resolvePackagePath(specPath, rootDir, [
    'proto/index.proto',
    'protos/index.proto',
    'index.proto',
    'main.proto',
    'service.proto',
  ])
}

export default defineNuxtModule<MockModuleOptions>({
  meta: {
    name: 'mock-fried',
    configKey: 'mock',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    enable: true,
    prefix: '/mock',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const logger = useLogger('mock-fried')

    // 비활성화 시 조기 리턴
    if (!options.enable) {
      logger.info('Mock module is disabled')
      return
    }

    const rootDir = nuxt.options.rootDir
    const prefix = options.prefix || '/mock'

    // OpenAPI 설정 처리
    let openapiPath: string | undefined
    let clientPackagePath: string | undefined
    let clientPackageConfig: OpenApiClientConfig | undefined

    if (options.openapi) {
      if (typeof options.openapi === 'string') {
        // 기존 방식: 스펙 파일 경로
        openapiPath = resolveOpenAPIPath(options.openapi, rootDir)
      }
      else {
        // 새 방식: 클라이언트 패키지 설정
        clientPackageConfig = options.openapi
        try {
          const require = createRequire(rootDir + '/package.json')
          const pkgJsonPath = require.resolve(`${options.openapi.package}/package.json`)
          clientPackagePath = normalize(resolve(pkgJsonPath, '..'))
        }
        catch {
          logger.warn(`Failed to resolve client package: ${options.openapi.package}`)
        }
      }
    }

    // Proto 경로 처리
    const protoPath = options.proto
      ? resolveProtoPath(options.proto, rootDir)
      : undefined

    // 서버 런타임 설정
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(nuxt.options.runtimeConfig as any).mock = {
      enable: options.enable,
      prefix,
      openapiPath,
      clientPackagePath,
      clientPackageConfig,
      protoPath,
      pagination: options.pagination,
      cursor: options.cursor,
      responseFormat: options.responseFormat ?? 'auto',
    } satisfies MockRuntimeConfig

    // 클라이언트 공개 런타임 설정
    nuxt.options.runtimeConfig.public.mock = {
      enable: options.enable,
      prefix,
    }

    // 스키마 핸들러 등록 (가장 먼저 - 구체적인 라우트)
    addServerHandler({
      route: `${prefix}/__schema`,
      method: 'get',
      handler: resolver.resolve('./runtime/server/handlers/schema'),
    })
    logger.info(`Schema handler registered at GET ${prefix}/__schema`)

    // RPC 핸들러 등록 (더 구체적인 라우트)
    if (protoPath) {
      addServerHandler({
        route: `${prefix}/rpc/:service/:method`,
        method: 'post',
        handler: resolver.resolve('./runtime/server/handlers/rpc'),
      })
      logger.info(`RPC mock handler registered at POST ${prefix}/rpc/:service/:method`)
    }

    // OpenAPI 핸들러 등록 (catch-all - 마지막)
    if (openapiPath || clientPackagePath) {
      addServerHandler({
        route: `${prefix}/**`,
        handler: resolver.resolve('./runtime/server/handlers/openapi'),
      })
      logger.info(`OpenAPI mock handler registered at ${prefix}/**`)
    }

    // 클라이언트 플러그인 등록
    addPlugin(resolver.resolve('./runtime/plugin'))

    // useApi composable auto-import
    addImports({
      name: 'useApi',
      from: resolver.resolve('./runtime/composables'),
    })

    // API Explorer 컴포넌트 등록
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      prefix: 'Mock',
    })

    logger.success(`Mock module initialized with prefix: ${prefix}`)
    if (openapiPath) logger.info(`  OpenAPI spec: ${openapiPath}`)
    if (clientPackagePath) logger.info(`  Client package: ${clientPackageConfig?.package}`)
    if (protoPath) logger.info(`  Proto path: ${protoPath}`)
  },
})
