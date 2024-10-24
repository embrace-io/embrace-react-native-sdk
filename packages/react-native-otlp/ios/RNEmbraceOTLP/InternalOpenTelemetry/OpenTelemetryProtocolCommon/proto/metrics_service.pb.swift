// DO NOT EDIT.
// swift-format-ignore-file
//
// Generated by the Swift generator plugin for the protocol buffer compiler.
// Source: opentelemetry/proto/collector/metrics/v1/metrics_service.proto
//
// For information on using the generated types, please see the documentation:
//   https://github.com/apple/swift-protobuf/

// Copyright 2019, OpenTelemetry Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Foundation
import SwiftProtobuf

// https://github.com/open-telemetry/opentelemetry-swift/blob/1.10.1/Sources/Exporters/OpenTelemetryProtocolCommon/proto/metrics_service.pb.swift

// If the compiler emits an error on this type, it is because this file
// was generated by a version of the `protoc` Swift plug-in that is
// incompatible with the version of SwiftProtobuf to which you are linking.
// Please ensure that you are building against the same version of the API
// that was used to generate this file.
fileprivate struct _GeneratedWithProtocGenSwiftVersion: SwiftProtobuf.ProtobufAPIVersionCheck {
  struct _2: SwiftProtobuf.ProtobufAPIVersion_2 {}
  typealias Version = _2
}

public struct Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsServiceRequest {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  /// An array of ResourceMetrics.
  /// For data coming from a single resource this array will typically contain one
  /// element. Intermediary nodes (such as OpenTelemetry Collector) that receive
  /// data from multiple origins typically batch the data before forwarding further and
  /// in that case this array will contain multiple elements.
  public var resourceMetrics: [Opentelemetry_Proto_Metrics_V1_ResourceMetrics] = []

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

public struct Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsServiceResponse {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  /// The details of a partially successful export request.
  ///
  /// If the request is only partially accepted
  /// (i.e. when the server accepts only parts of the data and rejects the rest)
  /// the server MUST initialize the `partial_success` field and MUST
  /// set the `rejected_<signal>` with the number of items it rejected.
  ///
  /// Servers MAY also make use of the `partial_success` field to convey
  /// warnings/suggestions to senders even when the request was fully accepted.
  /// In such cases, the `rejected_<signal>` MUST have a value of `0` and
  /// the `error_message` MUST be non-empty.
  ///
  /// A `partial_success` message with an empty value (rejected_<signal> = 0 and
  /// `error_message` = "") is equivalent to it not being set/present. Senders
  /// SHOULD interpret it the same way as in the full success case.
  public var partialSuccess: Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsPartialSuccess {
    get {return _partialSuccess ?? Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsPartialSuccess()}
    set {_partialSuccess = newValue}
  }
  /// Returns true if `partialSuccess` has been explicitly set.
  public var hasPartialSuccess: Bool {return self._partialSuccess != nil}
  /// Clears the value of `partialSuccess`. Subsequent reads from it will return its default value.
  public mutating func clearPartialSuccess() {self._partialSuccess = nil}

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}

  fileprivate var _partialSuccess: Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsPartialSuccess? = nil
}

public struct Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsPartialSuccess {
  // SwiftProtobuf.Message conformance is added in an extension below. See the
  // `Message` and `Message+*Additions` files in the SwiftProtobuf library for
  // methods supported on all messages.

  /// The number of rejected data points.
  ///
  /// A `rejected_<signal>` field holding a `0` value indicates that the
  /// request was fully accepted.
  public var rejectedDataPoints: Int64 = 0

  /// A developer-facing human-readable message in English. It should be used
  /// either to explain why the server rejected parts of the data during a partial
  /// success or to convey warnings/suggestions during a full success. The message
  /// should offer guidance on how users can address such issues.
  ///
  /// error_message is an optional field. An error_message with an empty value
  /// is equivalent to it not being set.
  public var errorMessage: String = String()

  public var unknownFields = SwiftProtobuf.UnknownStorage()

  public init() {}
}

#if swift(>=5.5) && canImport(_Concurrency)
extension Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsServiceRequest: @unchecked Sendable {}
extension Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsServiceResponse: @unchecked Sendable {}
extension Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsPartialSuccess: @unchecked Sendable {}
#endif  // swift(>=5.5) && canImport(_Concurrency)

// MARK: - Code below here is support for the SwiftProtobuf runtime.

fileprivate let _protobuf_package = "opentelemetry.proto.collector.metrics.v1"

extension Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsServiceRequest: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".ExportMetricsServiceRequest"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .standard(proto: "resource_metrics"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeRepeatedMessageField(value: &self.resourceMetrics) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if !self.resourceMetrics.isEmpty {
      try visitor.visitRepeatedMessageField(value: self.resourceMetrics, fieldNumber: 1)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsServiceRequest, rhs: Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsServiceRequest) -> Bool {
    if lhs.resourceMetrics != rhs.resourceMetrics {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsServiceResponse: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".ExportMetricsServiceResponse"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .standard(proto: "partial_success"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularMessageField(value: &self._partialSuccess) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    // The use of inline closures is to circumvent an issue where the compiler
    // allocates stack space for every if/case branch local when no optimizations
    // are enabled. https://github.com/apple/swift-protobuf/issues/1034 and
    // https://github.com/apple/swift-protobuf/issues/1182
    try { if let v = self._partialSuccess {
      try visitor.visitSingularMessageField(value: v, fieldNumber: 1)
    } }()
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsServiceResponse, rhs: Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsServiceResponse) -> Bool {
    if lhs._partialSuccess != rhs._partialSuccess {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}

extension Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsPartialSuccess: SwiftProtobuf.Message, SwiftProtobuf._MessageImplementationBase, SwiftProtobuf._ProtoNameProviding {
  public static let protoMessageName: String = _protobuf_package + ".ExportMetricsPartialSuccess"
  public static let _protobuf_nameMap: SwiftProtobuf._NameMap = [
    1: .standard(proto: "rejected_data_points"),
    2: .standard(proto: "error_message"),
  ]

  public mutating func decodeMessage<D: SwiftProtobuf.Decoder>(decoder: inout D) throws {
    while let fieldNumber = try decoder.nextFieldNumber() {
      // The use of inline closures is to circumvent an issue where the compiler
      // allocates stack space for every case branch when no optimizations are
      // enabled. https://github.com/apple/swift-protobuf/issues/1034
      switch fieldNumber {
      case 1: try { try decoder.decodeSingularInt64Field(value: &self.rejectedDataPoints) }()
      case 2: try { try decoder.decodeSingularStringField(value: &self.errorMessage) }()
      default: break
      }
    }
  }

  public func traverse<V: SwiftProtobuf.Visitor>(visitor: inout V) throws {
    if self.rejectedDataPoints != 0 {
      try visitor.visitSingularInt64Field(value: self.rejectedDataPoints, fieldNumber: 1)
    }
    if !self.errorMessage.isEmpty {
      try visitor.visitSingularStringField(value: self.errorMessage, fieldNumber: 2)
    }
    try unknownFields.traverse(visitor: &visitor)
  }

  public static func ==(lhs: Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsPartialSuccess, rhs: Opentelemetry_Proto_Collector_Metrics_V1_ExportMetricsPartialSuccess) -> Bool {
    if lhs.rejectedDataPoints != rhs.rejectedDataPoints {return false}
    if lhs.errorMessage != rhs.errorMessage {return false}
    if lhs.unknownFields != rhs.unknownFields {return false}
    return true
  }
}
