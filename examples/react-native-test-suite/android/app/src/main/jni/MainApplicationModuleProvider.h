#pragma once

#include <ReactCommon/JavaTurboModule.h>

#include <memory>
#include <string>

namespace facebook {
namespace react {

std::shared_ptr<TurboModule> MainApplicationModuleProvider(
    const std::string moduleName, const JavaTurboModule::InitParams &params);

}  // namespace react
}  // namespace facebook
