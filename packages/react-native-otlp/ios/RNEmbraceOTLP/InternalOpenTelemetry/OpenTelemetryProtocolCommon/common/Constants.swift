//
// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/open-telemetry/opentelemetry-swift/blob/1.10.1/Sources/Exporters/OpenTelemetryProtocolCommon/common/Constants.swift
//

import Foundation

public enum Constants {
  public enum OTLP {
    public static let version = "0.20.0"
  }
  public enum HTTP {
    public static let userAgent = "User-Agent"
  }
}
