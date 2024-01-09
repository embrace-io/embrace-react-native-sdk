# Upgrade guide

# Upgrading from 3.x to 4.x

Version X of the Embrace React Native SDK renames some functions. This has been done to reduce
confusion & increase consistency across our SDKs.

Functions that have been marked as deprecated will still work as before, but will be removed in
the next major version release. Please upgrade when convenient, and get in touch if you have a
use-case that isn’t supported by the new API.

| Old API             | New API               | Comments                                                              |
|---------------------|-----------------------|-----------------------------------------------------------------------|
| `setUserPersona`    | `addUserPersona`      | Renamed function for consistency                                      |
| `logBreadcrumb`     | `addBreadcrumb`       | Renamed function for consistency                                      |
| `logNetworkRequest` | `recordNetworkRequest`| Renamed function for consistency |
| Screenshots         | None                  | Please contact Embrace if you still want screenshots in logs/moments. |
