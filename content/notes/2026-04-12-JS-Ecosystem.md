---
title: "FE - JS Ecosystem"
date: 2026-04-12
tags:
    - javascript
    - frontend
    - react
    - nextjs
    - typescript
---

**State management is about three orthogonal concerns:**

1. **Where does state live?** (in-process, external store, distributed)
2. **Who gets notified when it changes?** (nobody, observers, a diffing engine)
3. **What are the consistency guarantees?** (single-threaded = trivial, concurrent = hard)

**React/Recoil** is opinionated about all three: state lives in atoms outside the tree, the renderer gets notified via subscriptions, and React's reconciler handles consistency. The whole category of "state management libraries" (Redux, Zustand, Jotai, Valtio) exists because React made concern #2 the hard problem.

**Django/Flask** - concern #1 is the hard one. Requests are stateless, so where do you put state? Answer: database, cache, session store. That's why Redis, Memcached, and Django's ORM dominate the conversation rather than anything like Recoil.

## JS - sync/async/webhooks

JS is single threaded

Sync vs Async

- sync - sequential
- async - context switching

JS-Provided async functions

- setTimeout - run a specific function after a set duration
    - when control reaches setTimeout, it doesnt wait for a second - the thread proceeds to the next function from the **call stack**
    - but the specific function waits for the duration and is then executed by the environment (browser)
    - how to make it sync? -busy waitinng - run a loop of 10e9 (as an e.g)
- fs.readFile - read a file from filesystem
- fetch - fetch some data from an endpoint - not js, provided by browser

Even if a callback is resolved, if the js thread is busy, the callback will not return.
Only when the thread is idle, will the resolved callback be executed (along with other pending callbacks from the **callback Queue**)

arrow function syntax - `(parameters) => { function body }`

Promises

- syntactic sugar for callback execution fns
- states - pending, resolved, rejected
- can be undefined
- Other benefits like Promise chaining
- return a Promise() (synchronously) - `Promise { <pending> }`
- promise_val.then(our_callback_func) - cleaner

Async Await syntax

- `let value = await myAsyncfunc()` instead of using the .then() syntax

Node.js

- enables backend dev in javascript
- chromes v8 engine + common backend functionalities = node.js runtime
- alternative - bun (written in zig) - significantly fast - might make it backward compatible
- can create http servers - CLIs, games, video player etc
- jwt, router, bodyParser, next(), mongoose mongodb schema enforcement etc

[a lot ERPs are hosted on http and not https]

## Express

```js
const express = require('express')
app.get('/', function (req, res) {
res.send('Hello World!')
})
```

- fastapi equivalent
- express returns a string, browser renders it z
- ??

### DOM

Document Object Model - API for web docuements

- making websites dynamic is hard
- document.getElementById, document.createElement, document.appendChild,
- element.setAttribute, element.children,

oninput - whenever input changes, do somethign
debouncing - if the user has not typed for 100ms, then send a request - how to implement?

```js
let timeout;
function debounceFunc(){
clearTimeout(timeout) // clear old clock, if func called again
const timeout = setTimeout(realFunc(), 100)
}
```

### React

- dynamically updating websites - dom manipulation was used, before react
- diff based old state and new state - virtual dom -
- react
- react native/dom

What is expected from the dev

- Re-rendering
- Components - "fixed" parts, how state is connected to the components - functino that takes state as input and returns html
- State - things that change

any time a parent re-renders, its child re-renders as well

vite - hot reloading, bundler, bootstrap

- state within state

- hooks start with use_ prefix

- a component can only return a single top level xml - makes it easy to do reconciliation

- // should trigger a re-render - but everyting is re-rendering // Re-rending triggered when state variable changes // Re-rending triggered when parent changes // how to minimise - push the state down // imagine the react app tree - keep the state at the Lowest Common Ancestor - until state management

- memoise - pass through React.memo - lets you skip re-rendering if props are unchanged

- Q - in re-renders - does only the state change or does the div change? - creates a new virtual dom, gets the diff, checks what needs to be updated, and updates it. can we update props of one component from another? Yes, but its an anti-pattern - find LCA and pass it down similarly, passing state from child to parent is an antipattern React.memo is different than useMemo

- `key={todo.id}` - providing the "key" helps while finding diffs and rendering optimally

- wrapper - render text and other components

- Hooks - they allow you to hook into the react state - define and update state variables - and the lifecycle features, Introduced in react 16.8

- functional components are new - post 2020, class based components before that gave access to lifecycle events (e.g onComponentMount) - hooks are provided to support them in functinoal components -

- side effect - any operations outside functional scope of react. They are not part of react rendering side. These needs to be seperate from the rendering cycle and should be seperate e.g call to backend
    - useEffect - allows you to perform side effects in funciton components. e.g data fetching, subscriptions - same purpose as componentDidMount, componentDUdpdate and componentWIllUnmount.

```js
useEffect(
fetch(), // funciton
[] // dependency array - when shoudl it run - empty = run it on first moutn
)
```

- useState - lets you descrive the state of your app. state update triggers a re-render which updates the dom.

- useCallback - used to memoise functinos - useCallback keeps the same function reference across renders - especially in cases invovling child comopnents that rely on referential equality to prevent unnecessary renders

- useMemo - use cached value instead of recomputing -

- useRef - `divRef(); add <div>ref={divRef}</div>, divRef.current.innerHTML=10` - to update

- single page application - all html css comes in a single go = no hard reload / fresh html - dynamically change rather than refetch from backend

- client side routing - bundle with js code
    - react-router-dom - `<button onClick={()=> {window.location.href="/"}}>landing</button>` - would hard reload - instead, use useNavigate("/dashboard")
    - useNavigate("/dashboard") can only be used inside browserRouter

- client side bundle - dev created

- Lazy loading - person will only come to one page - rather than giving the complete website bundle, give only parts -

- prop-drilling - anti- pattern ? - state is stored at LCA (least common ancestor of DOM tree) - push it down as much as possible (minimises rerenders) - structure - becomes verbose if not - rerender happens - where it is defined and where it is being used might be v far which makes it very ugly - we use Context API for it - "teleports" data

- context api - "Single Source of Truth" (SSOT) pattern - define context component, wrap the component using the context in the defined component. whenever the "count" variable NOT using useContext(CountContext) changes but its parent / child is re-rendered, it gets re-rendered as well. This optimisation is not provided. To have the functionality - "whoever does not use the CountContext, should not be used" - state management library provides this functionality. ContextAPI only fixes prop-drilling.

- companies open sources components, but not state logic. e.g razorpay

- Recoil - state management library - other popular libraries - zustand and redux.
    - Has concept of an atom to store the state. It is the smallest unit of state.
    - atom can defined outside the component. It can be teleported to any other component
    - RecoilRoot - need to wrap wherever recoil is use
    - useRecoilState
    - useRecoilValue
    - useSetRecoilState - for increase/decrease button values, we dont need to re-render buttonos, use useSetRecoilState for them
    - selector - when we know something completely depends on another state. Selectors are called "selectors" because they select and derive values from atoms.
    - asynchronous data queries - selectors can be uesed as one way to incoroporate async data into Recoil. applies for indempotent functions since the values get cached. e.g used when if we know the default value is coming from a function e.g `const my Atom -> default: selector({ key:.., get: async()=> we get data from this function }`
    - atomFamily - we need to create one atom per component - subscribe to atomFamily rather than the todo - dynamic atom creation
    - selectorFamily - atomFamily needs a selectorFamily to perform async data queries. the value returned is a function itself, parameterised by the input that was dynamically provided to the atomFamily. The returned function is cached, so for same input, multiple calls wont be made.
    - useRecoilStateLoadable -

- no need to use Recoil if we are not saving the state globally. e.g just for taking inputs, useState is enough

Frontend Framework - Understand how this is done

- flex and flexbox - position elements/divs right next to each other - div were designed to take the full width.
- grids -
- responsiveness
- background text color, hover etx

Tailwind CSS

- flex - to put things in the same line
- in html `<div style = "flec", justifyContent="space-between">` or: - flex-start, flex-end, center, space-between, space-around>
- in tailwind `<div className="flex justify-between">`
- grids
    - `<div className="grid grid-cols-3"` - default is equal width
    - `<div className="col-span-5"` - divide into columns and pick how much it should pick
- responsiveness
    - there are 5 breakpoints being defined
        - sm-640px
        - md - 768
        - lg, xl, 2xl
    - tailwind - mobile first breakpoint system
        - default to text center to target mobile, after that it should be differremt
        - e.g logo goes to bottom from top left - lg:flex - position becomes "lg:static" (when you reach the lg breakpoint, it becomes static) otherwuse it is "fixed"
        - also can be- by default it is visible OR sm:hidden, and inverse of sm,
- background text color, hover etx
    - font size, border radius (rounded-sm to rounded-full),
- Youtubee- ap-bar, sign in button, search bar, grid system,
    - build individual components and then glue them together
    - VideoCard, VideoGrid, AppBar,
    - copy from their docs e.g searchbar - good starting point. Copy svgs for icons, and paste.
- localStorage.setItem(key,value) - storing auth token on signin, .removeItem() while logging out to delete, localStorage.getItem("token") while sending requests. /me endpoint placed before /signup to redirect if token is available. /me - verify that token is valid as well, not just that it is present
- Link component to send user {to} another place. if the redirect is user input dependent, use the useNavigate() hook and call navigate() with the link (as long as the routing is not a hard reload)
- to get access to query params we can use useSearchParams() hook from router dom. searchParams.get("name")
- postman exposes a export as axios code (similar to how the curl command is viewed)
- returning a function from useEffect - returned functino is run when the component unmounts OR if the dependency array content changes. first cleanup (the returned func (from the previous useEffect)) happens, and then the main body runs. e.g clearing after 10 sec -
- useState(window.navigator.onLine), window.addEventListener('mousemove', handleMouseMoveCallback);

Typescript

- compile time type checking
- interface - you can implement interfaces as a class - use wherever they can be
- type - | , & , type age = number[]
- enum Direction { Up,Down}, Direction.Up
- Generics - components that work with any data type whil providing compile-time safety. `function identity<T>(arg: T){return}` - `identity<string>("mystring")`. TS can infer on the bases of input. e.g identity("string1")
- import/ export - ES6 module system
- Pick - pick specific alements from an interface `<User, 'name' | 'age'>`
- `type optionalUser = Partial<User>` - make fields optional
- readonly - js and ts dont complain if values INSIDE a const array is not changed. to chandet that, `ReadOnly<User>` and readonly name: string are used
- `Record<string,number>`: same as the key is a string, and the value is number
- `new Map<string, number>()` - use .set() , .get() - enforece key is string, value is number
- `<EventType, 'scroll'>` = scroll is excluded from EventType. exclude values from a type, Exclude

Zod

- runtime validation, zod.object({}), name: z.string().min(1,{message:"error validation failed"})
- type inference - can extract the typescript type of any schema with `z.infer<typeof myType>` - returns typescript type. ts is compile time validation
- zod is used in backend, type inference used when the type is needed in the frontend in monorepos

Prisma and ORMs

- prisma client - type safe query builders
- prima migrate - migration tool
- prisma studio - gui

Serverless backends

- scaling, charged even if unused,
- serverless - charge per request basis rather than paying for VM
- cold start - service is shut down, first user sees high latency - warm pool - maintain at least 1
- aws lambda, google cloud functions, cloudflare workers
- Use when
    - quick start,
    - cant anticipate traffic / v low traffic
- Cloudflare Workers
    - ddos protection - "turnstile" section
    - Cloudflare workers DONT use the Node.js runtime. They have created their own runtime based on V8. V8 orchestrates "isolates". Single runtime can have many isolates. their memory is not shared .
    - express relies heavily on node. express did not work even on Bun for a long time. express does not work on cloudflare workers. Write "generic" code that does not use express and thne only add the final routing through express/ cloudflare routers. Use "hono" web app routing engine.
    - hono - '/wild/*/card', Any HTTP methods app.all, Custom HTTP method,
        - // Multiple Method app.on(['PUT', 'DELETE'],
        - path parameters, optional, regexp - /posts/:id/comment/:comment_id?:title{[a-z]+}
    - wrangler is the CLI, can be used to login
    - async functions return Promises btw
    - connection pool = the db allows a single connection - worker connects to pool, pool maintains the connections to the db
    - "engine" is prisma dependency that is nodejs specific. to deploy to cloudflare workers, dont include it. npx prisma generate --no-engine
    - Connect the cloudflare worker to connection pools, and NOT directly to db, for it to work with prisma. "Prisma Accelerate" lets you use it with cloudflare workers. PrismaClient().$extends(withAccelerate())

aws - ec2

- change inbound on port 8080 to anywhere etc
- reverse proxy - port 80 on http and 443 on https (default port, wont need to specify in url) - direct to ports ie different processes -
- nginx - cahcing, load balancing, reverse proxy , web serving (by default)
    - apt install nginx, starts automatically on port 80
    - sudo vi /etc/nginx/nginx.conf - config file
    - change config from web serving to be used as reverse proxy -`http { server { listen 80; server_name backend.fromInternet.com; } location / {proxy_pass localhost:8080}}`

    - can remove the inbound rules after this

Certicate management

- [https://certbot.eff.org/](https://certbot.eff.org/)

CDNs

- content delivery network - object storages are sources of truth, CDNs get the s3 url, users get CDN urls and they handle caching
- e.g cloudfront
- point of presence - PoP - users hit CDNs PoPs - if it exists, returned, or else fetched from sourfces of truth
- distribution costs are higher
- frontends distributed through CDNs
    - (not for SSRs)
    - send the compiled build/ html cs js files to the CDNs to the cache
    - distribution - configure domain, origin access (via access control for CDN - create policy for s3 bucket, allowing CDN service principal access to a path),
- backends use edge network - no caching - just multiple servers

Next.js - fullstack framework

- React does not provide Routing (need libraries). Next js does implicitly
- React websites are not SEO optimised - next js fixes that
- Waterfall problem
    - blogging website flow - index html -> script.js -> /me -> add /username then add -> /blogs - happen serialisably
    - nextjs
        - server side rendering - what if in the initaial /index.html - initial html has the content, no need to call the js all blogs are provided - into a single request - helps in SEO.
        - if not, use react - next js is expensive to host
        - pre-render the page before
- bundle size optimisations (vite does it for react)
- static site generation
- maintained by vercel team
- CANNOT be distributed via a CDN, always need a server running that does server side rendering and hence it is expensive
- opinionated, hard to move out
- next is written on top of react
- file based router : files translate to routes
- Client and Server component
    - nextjs expects you to identify all your compinets as client or server
        - server components are rendered on the server - every component is a server by default
        - client components are pushed to the client to be rendered - add "use client" - generally state related - defer client as much as possible
            - server has a client child, and vice versa - make the button client side, import to sign in = sign in stays SEO optimised, client is deferred
- can deploy frontend and backend to the same aws machine
- layout.tsx at folder level for footer/header/banners
- loading.tsx for "loading..."
- backend
    - in api folder uner app
    - the component in nextjs can now define async components on the server
    - POST(req:NextRequest){ return NextResponse.json()}
    - backend logic in functions that return divs
    - Singleton for db client e.g globalThis.prisma
    - server actions - let you define a function that you can call both on the server component and browser can "sort of" call - specify "use server" at the top - otherwise it will be sent to the client
    - sharing the functino also lets you iknow the types
    - can be integrated seamleslly with forms (?)
- Middleware in Next.js 13 - auth, authentication, redirecting to user- weird here, probably changing
    - midldeware can also modify headers etc
    - expects a single file middlware.ts, though functions can be imported modularly
    - e.g someones token is present in the cookie, but it is not their latest token implies they logged in from another device - logout from the previous device by overriding token
- NextAuth
    - authentication in Next js
    - External providers like auth0 and firebase are expensive and vendor lockin-y - charge per user
    - catch all routes - /api/auth/* - folder name [..authRoutes] or [..courseId] under /api/auth.
    - [..nextauth] + NextAuth() handler - add providers - google github email etc
        - OAuth - google facebook etc
        - Email without password - otp like
        - Credentials - arbitrary creds - yubikey, 2fa, username password - customisable
    - session management post user creation is handled by NextAuth using SessionProvider - we write the authorize() logic
    - in a client component wrap SessionProvider - pass children as props -
    - allows callbacks within the login NextAuth() ocmponent - e.g for blocklists, or simply returning the jwt, sesison callback
    - adding google github etc - app url, callback url, secrets

Monorepo

- Build system - tsc, vite - transforms source code to binary code - transpile (ts to js),
- monorepo framework - manage prohects with multiple packages, dependancy mgmt, workspace configuration
- Build System orchestrator - turborepo - allows you to define tasks that call other tools to do builds etc - e.g order in whihc modules are build
    - lets you do caching
    - lets you do parallelisation
    - is DAG aware
- tries to add modules to global package to avoid repeated import

Auth using Cookies

- cookies also used for - session management, personalization, tracking across website
- browser-> server sets cookie-> browser sends cookie
- nextjs - server side rendering - the first request coming from the browser has users data - In react, we get the frontend bundle from CDN - the js html are same for all, while sending subsequent requests, localstorage cookie can be used. Cookies can be sent from the first page itself, hence nextjs only supports cookie based auth due to SSR
- Once the server sets the cookie, the browser will send it in every request by default. Browser sets Set-Cookie as well, when signin returns it
- can be restricted to use only with https (secure cookie), or expire in 24hrs etc
- Types of Cookies
    - Persistent -close website, reopen - still stay
    - session - go away after closing window
- Properties
    - cannot be accessed by client side script (no cookies.get("") - HttpOnly
    - domains - whitelist - only requests from specific domains will receive cookies in the response - SameSite - ensures cookies are not sent on cross origin requests
    - SameSite can be
        - strict - not open to csrf. exact same site (*.mysite.com) - BUT if i have an affiliate partner - recoMysite.com - site wont accept it. if n
        - lax - default - only on get erequests and top level navigation - different website allows to go. no post requests.
        - none - any site is allowed. poen to CSRF - if the cookie deosnt matter (theme etc- then its fine)
- CSRF attacks
    - Cross Site Request Forgery
    - some other domoain can receive the cookie and update the domain
- if different server - credentials=true in CORS config to allow it to be set from a different website and add origin ; use cookieParsers to process ; withCredentials=true
- express also can do frontend and backend on the samme server, but without react

Client Side Rendering vs Server Side rendering vs Static Site Generation (CSR vs SSR vs SSG)

- CSR - react does rendering in the browser using js, instead of the server sending a fully rendered HTMl page to client - between html injection and js running theres a white/grey screen flash (look out to detect) -
- SSR - populated pre-rendered html passed to client; expensive since every req needs to rendered (server side), no CDN caching.
- SSG - if a page is same for everyone, build it once on the server and send to everyone.
    - page is generated at build time, and then served.
    - can clear cache (revalidate) every 10 seconds,
    - revalidate() can be based on which page we come to
    - blogs, rarely update, ssg makes sense
    - how to statically genereate dynamic routes - getServerSidePaths
