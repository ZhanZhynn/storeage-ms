# Sentry production audit (historical)

> **Status (2026-05-19):** Cases 1–5 addressed in `f250980` (`REQ-0010`/`REQ-0011`). Case 6–7 = Chrome Translate `removeChild` (scrubbed in `lib/monitoring/sentry-config.ts`). US-East demo/fork traffic = expected. Post-deploy: 24h Sentry review per `REQ-0009`.

---

# I found those sentry email issues in the sentry dashboard

case 1:

Regression
Sentry marked STOCK-INVENTORY-8 as a regression

On this issue
Level
Error /
Product operation error:
Seen 2 times. Last seen: May 31, 2026, 9:11 a.m. UTC

error

sentry dashboard:

Error
Events (total)
Users (30d)
Level: Error
Product operation error:
13
4
Ongoing
|
/admin/products
|
4 Replays

Resolve

Archive

Priority
High
Assignee

Unassigned

All Envs

Since First Seen (19 days)
Filter events…

Events
13

Users
4
browser
62%
Chrome 148.0.0
url
62%
<https://stockly-inventory.vercel.app/>
environment
100%
production
turbopack
100%
True
View all tags and feature flags

Events
in this issue
First
Latest
Recommended

Copy as
ID: 5c2220a6
a day ago
|
JSON
Jump to:
Highlights
Stack Trace
Replay
Breadcrumbs
Trace
Tags
Context
Frontend
|
<test@admin.com>
Test Admin

Chrome
149.0.0

Windows

> =10
> production

Highlights

Edit
handled
handled
yes
level
level
error
transaction
transaction
/admin/products
url
url
<https://stockly-inventory.vercel.app/admin/products>
Trace: Trace ID
b59cb226de3440638a9f5f2a2d9e952d

Stack Trace

Display

Copy as
Error
Product operation error:
mechanism
generic
handled
true
lib/logger.ts:40:16
in
error

In App
return firstArg;
}
// Try to create error from string or object
if (typeof firstArg === "string") {
return new Error(firstArg);
}
if (typeof firstArg === "object" && firstArg !== null) {
if ("error" in firstArg && firstArg.error instanceof Error) {
return firstArg.error as Error;
lib/logger.ts:53:1
in
error
In App
components/products/ProductFormDialog.tsx:194:14
in
B
In App
Called from:
node_modules/react-hook-form/src/logic/createFormControl.ts:1430:11
in
<anonymous>

Session Replay

Breadcrumbs

Copy as
Exception - This event
error
Jun 8, 1:47:03.410 PM CEST
Error: Product operation error:
XHR
warning
Jun 8, 1:47:03.405 PM CEST
POST: <https://stockly-inventory.vercel.app/api/products> [400]

{
request_body_size: 240,
response_body_size: 30
}
XHR
warning
Jun 8, 1:47:01.782 PM CEST
POST: <https://stockly-inventory.vercel.app/api/products> [400]

{
request_body_size: 240,
response_body_size: 30
}
UI Click
info
Jun 8, 1:47:00.808 PM CEST
button.gap-2.whitespace-nowrap.text-sm.font-medium.focus-visible:outline-none.focus-visible:ring-1.focus-visible:ring-ring.disabled:pointer-events-none.disabled:opacity-50.[&_svg]:pointer-events-none.[&_svg]:size-4.[&_svg]:shrink-0.bg-primary.hover:bg-primary/90.py-2.5.h-11.w-full.sm:w-auto.px-11.inline-flex.items-center.justify-center.rounded-xl.border.border-rose-400/30.dark:border-rose-400/30.bg-gradient-to-r.from-rose-500/70.via-rose-500/50.to-rose-500/30.dark:from-rose-500/70.dark:via-rose-500/50.dark:to-rose-500/30.text-white.shadow-[0_15px_35px_rgba(225,29,72,0.45)].backdrop-blur-sm.transition.duration-200.hover:border-rose-300/40.hover:from-rose-500/80.hover:via-rose-500/60.hover:to-rose-500/40.dark:hover:border-rose-300/40.dark:hover:from-rose-500/80.dark:hover:via-rose-500/60.dark:hover:to-rose-500/40.hover:shadow-[0_20px_45px_rgba(225,29,72,0.6)][type="submit"]
UI Input
info
Jun 8, 1:46:58.966 PM CEST
input#sku.flex.w-full.rounded-md.px-3.py-2.5.text-base.transition-colors.file:border-0.file:bg-transparent.file:text-sm.file:font-medium.file:text-foreground.disabled:cursor-not-allowed.disabled:opacity-50.md:text-sm.focus-visible:outline-none.focus-visible:border-2.focus-visible:ring-2.dark:text-white.dark:placeholder:text-white/50.dark:focus-visible:border-sky-400.dark:focus-visible:ring-sky-400/30.h-11.bg-white/10.dark:bg-white/5.backdrop-blur-sm.border.border-rose-400/30.dark:border-white/20.text-white.placeholder:text-white/40.focus-visible:border-rose-400.focus-visible:ring-rose-500/50.shadow-[0_10px_30px_rgba(225,29,72,0.15)][type="text"][name="sku"]

View 96 more

Trace Preview
View Full Trace
0.00ms10.00s20.00s30.00s40.00s50.00s1.00min1.17min1.33min0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s
960 hidden spans, 1 hidden issue

2

http.server
—
GET /api/notifications/in-app/unread-count
822.33ms

2

http.server
—
POST /api/products
240.76ms

2

http.server
—
POST /api/products
298.51ms

Error
—
Product operation error: Error lib/logger.ts /admin/products

http.server
—
POST /api/products
1.85s

http.client
—
POST <https://qstash.upstash.io/v2/publish/https://stockly-inventory.vercel.app/api/email/queue/proce…>
761.38ms

2

prisma:client:operation
698.00ms

2

prisma:client:operation
737.45ms

2

http.server
—
GET /api/product-reviews/eligibility
746.48ms

2

http.server
—
GET /api/categories
219.48ms

2

http.server
—
GET /api/product-reviews/eligibility
629.26ms

2

http.server
—
GET /api/product-reviews/by-product/[productId]
658.29ms
327 hidden spans

HTTP Request
GET
/admin/products
stockly-inventory.vercel.app
Headers
Referer
<https://stockly-inventory.vercel.app/login>
User-Agent
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36

case 2:

Issue
Error POST /api/products
Error creating product:
ID: 8d03a9b35acd4f3a92e912071be8a064
May 31, 2026, 11:11:19 a.m. CEST
Project stock-inventory
environment production
Level error
Suspect Commits
restructure, migrate project and update tracked files
9e0bfd0 — Arnob Mahmud
Exception
Error: Error creating product:
File "../../../lib/logger.ts", line 40, in t
return new Error(firstArg);
File "../../../lib/logger.ts", line 53, in t
}
File "../../../app/api/products/route.ts", line 338, in j
logger.error("Error creating product:", error);
File "/var/task/\_\_\_next_launcher.cjs", line 216, in handler
await mod.handler(req, res, {
...
(5 additional frame(s) were not displayed)
Request
URL <https://stockly-inventory.vercel.app/api/products>
Method POST

sentry dashboard:

Error
Events (total)
Users (30d)
Level: Error
Error creating product:
16
0
Ongoing
|
POST /api/products

Resolve

Archive

Priority
High
Assignee

Unassigned

production

Since First Seen (9 days)
Filter events…

Events
16

Users
0
browser
63%
Chrome 148
release
100%
6a649d08844b
url
94%
<https://stockly-inventory.vercel.app/api/products>
environment
100%
production
View all tags and feature flags

Events
in this issue
First
Latest
Recommended

Copy as
ID: babed768
a day ago
|
JSON
Jump to:
Highlights
Stack Trace
Breadcrumbs
Trace
Tags
Context
Backend
|

node
v22.22.2

Linux
5.10.253-286.1015.amzn2.x86_64
6a649d08844b
production

Highlights

Edit
handled
handled
yes
level
level
error
transaction
transaction
POST /api/products
url
url
<https://stockly-inventory.vercel.app/api/products>
Trace: Trace ID
07c7a1ec34953733a955c33413e5c91c

Stack Trace

Display

Copy as
Error
Error creating product:
mechanism
generic
handled
true
../../../lib/logger.ts:40:16
in
t

In App
return firstArg;
}
// Try to create error from string or object
if (typeof firstArg === "string") {
return new Error(firstArg);
}
if (typeof firstArg === "object" && firstArg !== null) {
if ("error" in firstArg && firstArg.error instanceof Error) {
return firstArg.error as Error;
../../../lib/logger.ts:53:1
in
t
In App
../../../app/api/products/route.ts:338:12
in
j
In App
Called from:
/var/task/node_modules/next/dist/compiled/next-server/app-route-turbo.runtime.prod.js:5:20926
in
rB.do

Show 5 more frames
/var/task/\_\_\_next_launcher.cjs:216:7
in
handler
In App
Suspect Commit
Is this correct?

restructure, migrate project and update tracked files
Arnob Mahmud committed 9e0bfd0 2 months ago

Breadcrumbs

Copy as
Exception - This event
error
Jun 8, 1:43:00.824 PM CEST
Error: Error creating product:
Console
info
Jun 8, 1:43:00.820 PM CEST
prisma:error
Invalid `prisma.product.create()` invocation:

Inconsistent column data: Malformed ObjectID: provided hex string representation must be exactly 12 bytes, instead got: "", length 0 for the field 'categoryId'.

{

arguments: [
2 items
],
logger: console
}
HTTP
info
Jun 8, 1:40:48.351 PM CEST
<https://fancy-joey-5613.upstash.io/pipeline> [200]

{
http.method: POST
}
HTTP
info
Jun 8, 1:40:48.243 PM CEST
<https://fancy-joey-5613.upstash.io/pipeline> [200]

{
http.method: POST
}
HTTP
info
Jun 8, 1:40:48.145 PM CEST
<https://fancy-joey-5613.upstash.io/pipeline> [200]

{
http.method: POST
}

View 3 more

Trace Preview
View Full Trace
One other issue appears in the same trace.

Error: Product operation error:/
Product operation error:
0.00ms50.00s1.67min2.50min3.33min4.17min5.00min0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s
396 hidden spans, 5 hidden issues

Error
—
Error creating product: ../../../lib/logger.ts POST /api/products

Error
—
Error creating product: ../../../lib/logger.ts POST /api/products

Error
—
Product operation error: Error lib/logger.ts

Error
—
Error creating product: ../../../lib/logger.ts POST /api/products

Error
—
Product operation error: Error lib/logger.ts

http.server
—
POST /api/categories
797.88ms

2

prisma:client:operation
715.17ms

2

prisma:client:operation
108.88ms

2

prisma:client:operation
101.15ms

2

prisma:client:operation
301.47ms

2

http.server
—
GET /api/dashboard
2.97s

1

http.server
—
GET /categories/\*
5.83ms

HTTP Request

POST
/api/products
stockly-inventory.vercel.app
Headers
Accept
application/json, text/plain, _/_
Accept-Encoding
gzip, deflate, br, zstd
Accept-Language
en-US,en;q=0.9
Baggage
sentry-environment=production,sentry-release=6a649d08844b7f3825d99afd0ea793ab2c19da2b,sentry-public_key=d019cbc8a2397ee1afec438a97d323c8,sentry-trace_id=07c7a1ec34953733a955c33413e5c91c,sentry-org_id=[Filtered],sentry-sample_rand=0.8146096950636467,sentry-sample_rate=0.1
Connection
close
Show more...

Tags

browser
browser
Chrome 148
browser.name
name
Chrome
client_os
client_os
macOS
client_os.name
name
macOS
environment
environment
production
handled
handled
yes
level
level
error
mechanism
mechanism
generic
os
os
Linux
os.name
name
Linux
release
release
6a649d08844b
runtime
runtime
node v22.22.2
runtime.name
name
node
server_name
server_name
169.254.25.101
transaction
transaction
POST /api/products
turbopack
turbopack
True
url
url
<https://stockly-inventory.vercel.app/api/products>

Contexts
User
Geography
Ashburn, United States (US)
Browser

Name
Chrome
Version
148
Runtime

Name
node
Version
v22.22.2
Operating System

Kernel Version
5.10.253-286.1015.amzn2.x86_64
Name
Linux
App
Free Memory
940.6 MiB
Memory Usage
144.4 MiB
Start Time
2026-06-08T11:40:46.501Z(2 minutes before this event)
Client Operating System

Name
macOS
Cloud Resource
Provider
vercel
Region
iad1
Culture
Locale
en-US
Timezone
UTC
custom
clientVersion
6.19.3
code
P2023
message

Invalid `prisma.product.create()` invocation:

Inconsistent column data: Malformed ObjectID: provided hex string representation must be exactly 12 bytes, instead got: "", length 0 for the field 'categoryId'.
meta

{
2 items
}
name
PrismaClientKnownRequestError
stack
PrismaClientKnownRequestError:
Invalid `prisma.product.create()` invocation:

Inconsistent column data: Malformed ObjectID: provided hex string representation must be exactly 12 bytes, instead got: "", length 0 for the field 'categoryId'.
at ei.handleRequestError (/var/task/node_modules/@prisma/client/runtime/library.js:121:7268)
at ei.handleAndLogRequestError (/var/task/node_modules/@prisma/client/runtime/library.js:121:6593)
at ei.request (/var/task/node_modules/@prisma/client/runtime/library.js:121:6300)
at async a (/var/task/node_modules/@prisma/client/runtime/library.js:130:9551)
at async j (/var/task/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_0m8qq3r.js:2:3290)
at async rB.do (/var/task/node_modules/next/dist/compiled/next-server/app-route-turbo.runtime.prod.js:5:20926)
at async rB.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route-turbo.runtime.prod.js:5:25709)
at async d (/var/task/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_0m8qq3r.js:2:15854)
at async rB.handleResponse (/var/task/node_modules/next/dist/compiled/next-server/app-route-turbo.runtime.prod.js:1:119139)
at async s (/var/task/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_0m8qq3r.js:2:16895)
Device
Architecture
x64
Boot Time
2026-06-08T11:38:55.119Z(4 minutes before this event)
CPU Description
Intel(R) Xeon(R) Processor @ 2.50GHz
Free Memory
940.6 MiB
Memory Size
1.2 GiB
Processor Count
2
Processor Frequency (MHz)
0
Trace Details
Span ID
75451daa482c8125
Status
unknown
Trace ID
07c7a1ec34953733a955c33413e5c91c

case 3:

New issue
We notified recently active members in the stock-inventory project of this issue
Issue
Error POST /api/invoices
Error creating invoice:
ID: 834abc03090743cab60a1889b1e03bb4
June 7, 2026, 6:08:38 p.m. CEST
Project stock-inventory
environment production
Level error
Exception
Error: Error creating invoice:
File "../../../lib/logger.ts", line 40, in t
return new Error(firstArg);
File "../../../lib/logger.ts", line 53, in t
}
File "../../../app/api/invoices/route.ts", line 273, in POST
logger.error("Error creating invoice:", error);
File "/var/task/\_\_\_next_launcher.cjs", line 216, in handler
await mod.handler(req, res, {
...
(5 additional frame(s) were not displayed)
Request
URL <https://stockly-inventory.vercel.app/api/invoices>
Method POST

sentry dashboard:

Error
Events (total)
Users (30d)
Level: Error
Error creating invoice:
9
0
New
|
POST /api/invoices

Resolve

Archive

Priority
High
Assignee

Unassigned

production

Since First Seen (2 days)
Filter events…

Events
9

Users
0
browser
78%
Firefox 151.0
release
100%
6a649d08844b
url
100%
<https://stockly-inventory.vercel.app/api/invoices>
environment
100%
production
View all tags and feature flags

Events
in this issue
First
Latest
Recommended

Copy as
ID: 09ffc5d2
17 hours ago
|
JSON
Jump to:
Highlights
Stack Trace
Breadcrumbs
Trace
Tags
Context
Backend
|

node
v22.22.2

Linux
5.10.253-286.1015.amzn2.x86_64
6a649d08844b
production

Highlights

Edit
handled
handled
yes
level
level
error
transaction
transaction
POST /api/invoices
url
url
<https://stockly-inventory.vercel.app/api/invoices>
Trace: Trace ID
1ebe63bde1d140afa9c1fc33d2c62496

Stack Trace

Display

Copy as
Error
Error creating invoice:
mechanism
generic
handled
true
../../../lib/logger.ts:40:16
in
t

In App
return firstArg;
}
// Try to create error from string or object
if (typeof firstArg === "string") {
return new Error(firstArg);
}
if (typeof firstArg === "object" && firstArg !== null) {
if ("error" in firstArg && firstArg.error instanceof Error) {
return firstArg.error as Error;
../../../lib/logger.ts:53:1
in
t
In App
../../../app/api/invoices/route.ts:273:12
in
POST
In App
Called from:
/var/task/node_modules/next/dist/compiled/next-server/app-route-turbo.runtime.prod.js:5:20926
in
rB.do

Show 5 more frames
/var/task/\_\_\_next_launcher.cjs:216:7
in
handler
In App

Breadcrumbs

Copy as
Exception - This event
error
Jun 8, 7:07:52.856 PM CEST
Error: Error creating invoice:
HTTP
info
Jun 8, 7:07:52.414 PM CEST
<https://fancy-joey-5613.upstash.io/pipeline> [200]

{
http.method: POST
}
HTTP
info
Jun 8, 7:07:52.316 PM CEST
<https://fancy-joey-5613.upstash.io/pipeline> [200]

{
http.method: POST
}
HTTP
info
Jun 8, 7:07:52.217 PM CEST
<https://fancy-joey-5613.upstash.io/pipeline> [200]

{
http.method: POST
}
HTTP
info
Jun 8, 7:07:52.115 PM CEST
<https://fancy-joey-5613.upstash.io/pipeline> [200]

{
http.method: POST
}

View 9 more

Trace Preview
View Full Trace
0.00ms5.00s10.00s15.00s20.00s25.00s30.00s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s
8 hidden spans, 6 hidden issues

Error
—
Error creating invoice: ../../../lib/logger.ts POST /api/invoices

Error
—
Error creating invoice: ../../../lib/logger.ts POST /api/invoices

Error
—
Error creating invoice: ../../../lib/logger.ts POST /api/invoices

Error
—
Error creating invoice: ../../../lib/logger.ts POST /api/invoices

HTTP Request

POST
/api/invoices
stockly-inventory.vercel.app
Headers
Accept
application/json, text/plain, _/_
Accept-Encoding
gzip, deflate, br, zstd
Accept-Language
en-US,ru;q=0.9
Baggage
sentry-environment=production,sentry-public_key=d019cbc8a2397ee1afec438a97d323c8,sentry-trace_id=1ebe63bde1d140afa9c1fc33d2c62496,sentry-org_id=[Filtered],sentry-sampled=false,sentry-sample_rand=0.18183743078838566,sentry-sample_rate=0.1
Connection
close
Show more...

Tags

browser
browser
Firefox 151.0
browser.name
name
Firefox
client_os
client_os
Windows >=10
client_os.name
name
Windows
environment
environment
production
handled
handled
yes
level
level
error
mechanism
mechanism
generic
os
os
Linux
os.name
name
Linux
release
release
6a649d08844b
runtime
runtime
node v22.22.2
runtime.name
name
node
server_name
server_name
169.254.6.33
transaction
transaction
POST /api/invoices
turbopack
turbopack
True
url
url
<https://stockly-inventory.vercel.app/api/invoices>

Contexts
User
Geography
Ashburn, United States (US)
Browser

Name
Firefox
Version
151.0
Runtime

Name
node
Version
v22.22.2
Operating System

Kernel Version
5.10.253-286.1015.amzn2.x86_64
Name
Linux
App
Free Memory
924.3 MiB
Memory Usage
160.9 MiB
Start Time
2026-06-08T17:06:52.682Z(a minute before this event)
Client Operating System

Name
Windows
Version

> =10
> Cloud Resource
> Provider
> vercel
> Region
> iad1
> Culture
> Locale
> en-US
> Timezone
> UTC
> custom
> message
> Invoice already exists for order 69af1a05445271dd05850f29
> name
> Error
> stack
> Error: Invoice already exists for order 69af1a05445271dd05850f29

    at a (/var/task/.next/server/chunks/[root-of-the-server]__0gsgp03._.js:2:12418)
    at async b (/var/task/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_0nc-okw.js:2:3821)
    at async rB.do (/var/task/node_modules/next/dist/compiled/next-server/app-route-turbo.runtime.prod.js:5:20926)
    at async rB.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route-turbo.runtime.prod.js:5:25709)
    at async d (/var/task/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_0nc-okw.js:2:8177)
    at async rB.handleResponse (/var/task/node_modules/next/dist/compiled/next-server/app-route-turbo.runtime.prod.js:1:119139)
    at async s (/var/task/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_0nc-okw.js:2:9218)
    at async Module.B [as handler] (/var/task/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_0nc-okw.js:2:10325)
    at async handler (/var/task/___next_launcher.cjs:216:7)
    at async Server.r (/opt/rust/nodejs.js:2:15575)

Device
Architecture
x64
Boot Time
2026-06-08T17:06:11.794Z(2 minutes before this event)
CPU Description
Intel(R) Xeon(R) Processor @ 2.50GHz
Free Memory
924.3 MiB
Memory Size
1.2 GiB
Processor Count
2
Processor Frequency (MHz)
0
Trace Details
Span ID
6a8018ef360590cc
Status
unknown
Trace ID
1ebe63bde1d140afa9c1fc33d2c62496

case 4:

Issue
Error GET /api/auth/oauth/google/callback
Google OAuth error:
ID: 233a49bae0614e4d894bd56a4b92ae93
June 8, 2026, 5:47:11 p.m. CEST
Project stock-inventory
environment production
Level error
Suspect Commits
update photo and add logger and error handling in development
5192e3e — Arnob Mahmud
Exception
Error: Google OAuth error:
File "../../../lib/logger.ts", line 40, in t
return new Error(firstArg);
File "../../../lib/logger.ts", line 53, in t
}
File "../../../app/api/auth/oauth/google/callback/route.ts", line 131, in U
logger.error("Google OAuth error:", error);
...
(5 additional frame(s) were not displayed)
Request
URL <https://stockly-inventory.vercel.app/api/auth/oauth/google/callback>
Method GET
Query error=access_denied&state=MTVxeW03aGh2YXpnY3VlaXUxajR0cA%3D%3D

sentry dashboard:

Error
Events (total)
Users (30d)
Level: Error
Google OAuth error:
1
0
New
|
GET /api/auth/oauth/google/callback

Resolve

Archive

Priority
High
Assignee

Unassigned

production

Since First Seen (18 hours)
Filter events…

Event
1

Users
0
browser
100%
Chrome 148
release
100%
6a649d08844b
url
100%
<https://stockly-inventory.vercel.app/api/auth/oauth/google/callback>
environment
100%
production
View all tags and feature flags

Events
in this issue
First
Latest
Recommended

Copy as
ID: 233a49ba
18 hours ago
|
JSON
Jump to:
Highlights
Stack Trace
Breadcrumbs
Trace
Tags
Context
Backend
|

node
v22.22.2

Linux
5.10.253-286.1015.amzn2.x86_64
6a649d08844b
production

Highlights

Edit
handled
handled
yes
level
level
error
transaction
transaction
GET /api/auth/oauth/google/callback
url
url
<https://stockly-inventory.vercel.app/api/auth/oauth/google/callback>
Trace: Trace ID
486e1bb89bf8c9c652af2302fa221866

Stack Trace

Display

Copy as
Error
Google OAuth error:
mechanism
generic
handled
true
../../../lib/logger.ts:40:16
in
t

In App
return firstArg;
}
// Try to create error from string or object
if (typeof firstArg === "string") {
return new Error(firstArg);
}
if (typeof firstArg === "object" && firstArg !== null) {
if ("error" in firstArg && firstArg.error instanceof Error) {
return firstArg.error as Error;
../../../lib/logger.ts:53:1
in
t
In App
../../../app/api/auth/oauth/google/callback/route.ts:131:14
in
U
In App
Called from:
node:internal/async_local_storage/async_hooks:80:14
in
AsyncLocalStorage.run

Show 6 more frames
Suspect Commit
Is this correct?

update photo and add logger and error handling in development
Arnob Mahmud committed 5192e3e a month ago

Breadcrumbs

Copy as
Exception - This event
error
Jun 8, 5:47:11.501 PM CEST
Error: Google OAuth error:
HTTP
info
Jun 8, 5:34:21.856 PM CEST
<https://fancy-joey-5613.upstash.io/pipeline> [200]

{
http.method: POST
}
HTTP
info
Jun 8, 5:34:21.757 PM CEST
<https://fancy-joey-5613.upstash.io/pipeline> [200]

{
http.method: POST
}
HTTP
info
Jun 8, 5:34:21.658 PM CEST
<https://fancy-joey-5613.upstash.io/pipeline> [200]

{
http.method: POST
}
Console
info
Jun 8, 5:34:21.602 PM CEST
✓ Connected to the database

{

arguments: [
1 item
],
logger: console
}

View 2 more

Trace Preview
View Full Trace
0.00ms0.00ms0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s

1
Trace
—
486e1bb89bf8c9c652af2302fa221866

Error
—
Google OAuth error: Error ../../../lib/logger.ts GET /api/auth/oauth/google/callback

HTTP Request

GET
/api/auth/oauth/google/callback
stockly-inventory.vercel.app
Query String
error
access*denied
state
MTVxeW03aGh2YXpnY3VlaXUxajR0cA==
Headers
Accept
text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/\_;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding
gzip, deflate, br, zstd
Accept-Language
en-US,en;q=0.9
Connection
close
Host
stockly-inventory.vercel.app
Show more...

Tags

browser
browser
Chrome 148
browser.name
name
Chrome
client_os
client_os
macOS
client_os.name
name
macOS
environment
environment
production
handled
handled
yes
level
level
error
mechanism
mechanism
generic
os
os
Linux
os.name
name
Linux
release
release
6a649d08844b
runtime
runtime
node v22.22.2
runtime.name
name
node
server_name
server_name
169.254.28.77
transaction
transaction
GET /api/auth/oauth/google/callback
turbopack
turbopack
True
url
url
<https://stockly-inventory.vercel.app/api/auth/oauth/google/callback>

Contexts
User
Geography
Ashburn, United States (US)
Browser

Name
Chrome
Version
148
Runtime

Name
node
Version
v22.22.2
Operating System

Kernel Version
5.10.253-286.1015.amzn2.x86_64
Name
Linux
App
Free Memory
940.6 MiB
Memory Usage
146.2 MiB
Start Time
2026-06-08T15:34:19.996Z(13 minutes before this event)
Client Operating System

Name
macOS
Cloud Resource
Provider
vercel
Region
iad1
Culture
Locale
en-US
Timezone
UTC
Device
Architecture
x64
Boot Time
2026-06-08T15:34:04.516Z(13 minutes before this event)
CPU Description
Intel(R) Xeon(R) Processor @ 2.50GHz
Free Memory
940.6 MiB
Memory Size
1.2 GiB
Processor Count
2
Processor Frequency (MHz)
0
Trace Details
Span ID
cfe3115ea36e9a69
Status
unknown
Trace ID
486e1bb89bf8c9c652af2302fa221866

---

# AUDIT REPORT — 2026-06-09

## TL;DR

| Case | Error | Origin | Codebase Bug? | Action |
|------|-------|--------|--------------|--------|
| 1 | `Product operation error:` | Client catches API 400 | Partial | Fix Case 2 + logger; Case 1 resolves |
| 2 | `Error creating product:` | Empty `categoryId` reaches Prisma | **YES** | Add validation in API route |
| 3 | `Error creating invoice:` | Duplicate invoice attempt | Partial | Return 409; don't send to Sentry |
| 4 | `Google OAuth error:` | User clicked "Cancel" on Google | **NO** | Change `logger.error` → `logger.warn` |

---

## Case 1 — `Product operation error:` (STOCK-INVENTORY-8)

**Signal:** 13 events, 4 users, `/admin/products`, client-side, `handled: true`

**What happened:** Demo user `test@admin.com` submitted product form → got `POST /api/products [400]` twice → `createProductMutation.mutateAsync` threw → `catch` block at `ProductFormDialog.tsx:194` called `logger.error("Product operation error:", error)` → Sentry captured.

**Root cause:** Not a standalone bug. Two contributing issues:
1. The underlying 400s come from Case 2's pattern — form allows empty `categoryId` → server rejects
2. `logger.error("Product operation error:", error)` sends a useless error to Sentry: message is just the label string "Product operation error:" with no detail (see logger bug below)

**Is this ignorable?** Mostly. Fix Case 2 + the logger issue and these events stop.

**No direct fix needed here** — it's a symptom.

---

## Case 2 — `Error creating product:` — REAL BUG

**Signal:** 16 events, 0 users, `POST /api/products`, server-side

**Root cause confirmed:** Prisma threw `PrismaClientKnownRequestError P2023`:
```
Malformed ObjectID: provided hex string representation must be exactly 12 bytes,
instead got: "", length 0 for the field 'categoryId'.
```
User submitted product form with `categoryId: ""` (no category selected).

**Why it reaches Prisma:** Two-layer gap:

1. **Form layer** — `productSchema` in `lib/validations/product.ts` does NOT include `categoryId` (it's managed via separate `selectedCategory` state, not react-hook-form). Zero client-side validation on it. Form can submit with `selectedCategory = ""`.

2. **API layer** — `POST /api/products` at `app/api/products/route.ts:203` manually checks only `name, sku, price, quantity`. `categoryId` not checked. `createProductSchema` exists with `categoryId: z.string().min(1)` but is **NOT used** in the POST handler (unlike the invoice route which correctly uses `createInvoiceSchema.safeParse`).

**Who triggers this:** Demo/fork users exploring the app with no categories set up, or users who open the form before categories load.

**Fix required — two spots:**

**Fix A** — `app/api/products/route.ts:203` — add `categoryId` and `supplierId` guard:
```ts
if (!name || !sku || price === undefined || quantity === undefined || !categoryId || !supplierId) {
  return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
}
```
Or better: use `createProductSchema.safeParse(body)` like the invoice route does.

**Fix B** — `ProductFormDialog.tsx:onSubmit` — validate `selectedCategory` before calling `mutateAsync`:
```ts
if (!selectedCategory) {
  // show toast or form error
  return;
}
```

---

## Case 3 — `Error creating invoice:` — WRONG STATUS + SENTRY NOISE

**Signal:** 9 events, 0 users, `POST /api/invoices`, Firefox 151, `Accept-Language: en-US,ru;q=0.9` (Russian demo user)

**Root cause:** `prisma/invoice.ts:65` throws `Error("Invoice already exists for order ${data.orderId}")` when an invoice already exists for that order. This bubbles up to the generic `catch` in `app/api/invoices/route.ts:272` which:
1. Calls `logger.error("Error creating invoice:", error)` → **sends to Sentry** (wrong — this is expected business behavior)
2. Returns `{ error: error.message }` with **status 500** (wrong — should be 409 Conflict)

**Is this ignorable?** No — the 500 status is incorrect. But the actual behavior (blocking duplicate invoices) is correct.

**Fix required — `app/api/invoices/route.ts` POST handler:**

Before the generic catch, or inside it, detect the duplicate invoice error and return 409:
```ts
} catch (error) {
  if (error instanceof Error && error.message.startsWith("Invoice already exists")) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  logger.error("Error creating invoice:", error);
  return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
}
```
This also stops the duplicate-invoice case from reaching Sentry.

---

## Case 4 — `Google OAuth error:` — USER ACTION, NOT A BUG

**Signal:** 1 event, 0 users, `GET /api/auth/oauth/google/callback?error=access_denied&state=...`

**Root cause:** User clicked "Cancel" / "Deny" on Google's OAuth consent screen. Google sends `?error=access_denied` to the callback URL. The callback at `app/api/auth/oauth/google/callback/route.ts:130-134`:
```ts
if (error) {
  logger.error("Google OAuth error:", error);  // ← sends "access_denied" to Sentry
  return NextResponse.redirect("/login?error=oauth_failed");
}
```
`logger.error` in production → `captureException` → Sentry noise.

**Verdict:** Pure user action. Google spec says `access_denied` = user cancelled. This should never reach Sentry.

**Fix required — one-line change** in `route.ts:131`:
```ts
// Before:
logger.error("Google OAuth error:", error);
// After:
logger.warn("Google OAuth cancelled by user:", error);  // warn only; does NOT go to Sentry
```
Or simply remove the log line — the redirect to `/login?error=oauth_failed` is sufficient.

---

## Cross-cutting: Logger Design Bug (affects all error messages in Sentry)

**File:** `lib/logger.ts` — `extractError` function (line 39):
```ts
if (typeof firstArg === "string") {
  return new Error(firstArg);  // ← uses the LABEL, not the actual error
}
```

When called as `logger.error("Error creating product:", prismaError)`:
- `args[0]` = `"Error creating product:"` (the label)
- `args[1]` = the actual `PrismaClientKnownRequestError`
- `extractError` sees `args[0]` is a string → returns `new Error("Error creating product:")`
- `captureException(new Error("Error creating product:"), prismaError)` — real error is demoted to context

**Result:** Every Sentry error shows `"Error creating product:"` / `"Error creating invoice:"` with zero message. Real error only visible buried in Sentry context panel.

**Fix** — when `args[1]` is an Error, use it as the primary exception:
```ts
// In createLogger, level === "error" block:
return (...args: unknown[]) => {
  // If pattern is logger.error("label:", realError), use realError as primary
  if (args.length > 1 && args[1] instanceof Error) {
    captureException(args[1], { extra: { label: String(args[0]) } });
    return;
  }
  const error = extractError(args);
  if (error) {
    captureException(error, args.length > 1 && typeof args[1] === "object" ? args[1] as Record<string, unknown> : undefined);
  }
};
```

---

## Summary: What Needs Code Change

| # | File | Change | Priority |
|---|------|--------|----------|
| 1 | `app/api/products/route.ts:203` | Add `!categoryId \|\| !supplierId` guard | **High** — causes P2023 crashes |
| 2 | `components/products/ProductFormDialog.tsx:onSubmit` | Validate `selectedCategory` before submit | **High** — client-side guard |
| 3 | `app/api/invoices/route.ts:272` | Return 409 for duplicate invoice; don't Sentry-log it | **Medium** — wrong status |
| 4 | `app/api/auth/oauth/google/callback/route.ts:131` | `logger.error` → `logger.warn` for `access_denied` | **Low** — 1 event, pure UX |
| 5 | `lib/logger.ts` `extractError` | Use `args[1]` when it's an Error as primary exception | **Medium** — Sentry error quality |

## What Is NOT a Bug

- Users cannot delete products with active orders → correct 409 behavior, no code issue
- Case 2/3 triggered by foreign demo/fork users from US East (Vercel `iad1`) — expected for a public demo
- Chrome translate `removeChild` — already handled by `isBrowserTranslationRemoveChildError` scrub
- The overall app working correctly for normal flows confirmed by your own usage
