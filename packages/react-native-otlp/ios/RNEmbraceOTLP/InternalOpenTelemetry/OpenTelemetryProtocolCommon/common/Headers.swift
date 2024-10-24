//
// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/open-telemetry/opentelemetry-swift/blob/1.10.1/Sources/Exporters/OpenTelemetryProtocolCommon/common/Headers.swift
//

import Foundation
import OpenTelemetryApi

public struct Headers {
  // GetUserAgentHeader returns an OTLP header value of the form "OTel OTLP Exporter Swift/{{ .Version }}"
  // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#user-agent
  public static func getUserAgentHeader() -> String {
    var version = Constants.OTLP.version
    if !version.isEmpty && version.hasPrefix("v") {
      version = String(version.dropFirst(1))
    }
    let userAgent = "OTel-OTLP-Exporter-Swift/\(version)"
    
    return userAgent
  }
}
