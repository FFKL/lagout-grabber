# Lagout grabber

Books grabber for doc.lagout.com. Potentially can be used for any site.

## Command line options

```
Options:
  -h, --help                       Show help                                   [boolean]
  -v, --version                    Show version number                         [boolean]
  -f, --force                      Rewrite existing files                      [boolean] [default: false]
  -r, --root-pathname              Crawling from this pathname                 [string]
  -l, --write-logs                 Write logs to file system                   [boolean]
  -w, --file-extensions-whitelist  List of allowed extensions                  [array]
  -b, --file-extensions-blacklist  List of banned extensions                   [array]
      --paths-whitelist            List of allowed paths to crawl              [array]
      --paths-blacklist            List of banned paths to crawl               [array]
      --logs-dir                   Output logs directory                       [string]
  -o, --output-dir                 Directory to uploading files                [string]
      --base-url                   Url to start crawling                       [string]
      --link-selector              CSS selector for collecting links on a page [string]
```