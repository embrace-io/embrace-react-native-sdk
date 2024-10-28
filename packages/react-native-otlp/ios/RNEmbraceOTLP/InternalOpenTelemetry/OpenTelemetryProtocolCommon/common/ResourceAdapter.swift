/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 * https://github.com/open-telemetry/opentelemetry-swift/blob/1.10.1/Sources/Exporters/OpenTelemetryProtocolCommon/common/ResourceAdapter.swift
 */

import Foundation
import OpenTelemetrySdk

public struct ResourceAdapter {
  public static func toProtoResource(resource: Resource) -> Opentelemetry_Proto_Resource_V1_Resource {
    var outputResource = Opentelemetry_Proto_Resource_V1_Resource()
    resource.attributes.forEach {
      let protoAttribute = CommonAdapter.toProtoAttribute(key: $0.key, attributeValue: $0.value)
      outputResource.attributes.append(protoAttribute)
    }
    return outputResource
  }
}
