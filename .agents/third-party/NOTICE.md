# Third-party skill notices

The repository's BSD-2-Clause license covers its original scaffold. Vendored skill bundles
retain their upstream terms:

| Bundle                | Source                                                      | License                                     |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------- |
| grill-me and grilling | [mattpocock/skills](https://github.com/mattpocock/skills)   | [MIT notice](mattpocock-LICENSE.txt)        |
| impeccable            | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | [Apache-2.0 notice](impeccable-LICENSE.txt) |

Installed source/versions and payload digests are in [vendor.json](../vendor.json);
grill-me/grilling installer hashes are in [skills-lock.json](../../skills-lock.json).
Upstream skill and resource text has not been rewritten. Platform-native mirrors are generated,
versioned copies governed by these same licenses. Review source, license, dependency wiring,
and scripts again on any future vendor update.
