The instrumentation library in this folder makes no assumptions about being used with it Embrace, it simply expects an
OTel Tracer Provider. As such it could be useful for anyone wanting to instrument React Native navigation if they
are not users of Embrace. Our plan is to contribute [this](https://github.com/open-telemetry/opentelemetry-js-contrib/pull/2359) to the [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib) repo
and then to point to that as a dependency and remove the code in this folder.