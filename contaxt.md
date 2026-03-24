Context API vs Redux vs Zustand + Axios
Beginner‑friendly detailed notes

1. Big Picture: What Are These?
In React apps you usually face two major problems:

State sharing

“How do I share data (user, theme, cart, filters, etc.) between many components without passing props down 5 levels?”

Talking to APIs

“How do I call backend APIs (GET/POST/PUT/DELETE), handle loading & error, and keep the data in sync with the UI?”

Tools in this note:

Context API, Redux, Zustand → state management / state sharing

Axios → HTTP client for API calls

Think of it like this:

React = UI

Context / Redux / Zustand = where you store data

Axios = how you fetch/send data from/to backend

2. React Context API
2.1 What Is Context API?
Built into React, no extra library.

Lets you create a context (a box) that holds data.

You wrap your components in a Provider that supplies values.

Any child component can read the value using useContext, without prop‑drilling.

tsx
// context/AuthContext.tsx
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// use in a component
const { user, login, logout } = useContext(AuthContext)!;
2.2 When to Use Context
Good for simple, app‑wide data, especially where:

Data changes, but not extremely frequently.

You don’t need advanced tooling or patterns.

Examples:

Current user / auth data (id, name, token, roles)

Theme (dark/light)

Locale / language

Global config (API base URL, feature flags that change rarely)

2.3 Pros
No extra dependency.

Simple to understand (Provider → Consumer).

Great for replacing prop‑drilling for a few key “global” pieces of data.

2.4 Cons
If you put everything in context, you create:

Big objects, hard to maintain

Accidental re‑renders (when context value changes, many consumers re‑render)

No strong conventions for structure (everyone can do it differently).

Debugging bigger apps can be painful (no built‑in time‑travel devtools).

2.5 Mental Model
Context is a shared box you place at the top of a part of your tree so children can read from it directly, without passing through every intermediate component.

Use for global, simple, low‑churn data, not as a full state‑management framework.

3. Redux (with Redux Toolkit)
3.1 What Is Redux?
Redux is a centralized, predictable state container with strict rules.

Core concepts:

Store – holds your entire app state as a single object (or a tree).

Action – an object that describes “what happened”, e.g. { type: 'cart/addItem', payload: item }.

Reducer – a pure function (state, action) → newState.

Dispatch – function used by components to send actions to the store.

Data flow:

UI dispatches an action.

Redux passes it to reducers.

Reducers return new state.

UI re‑renders with the updated state.

3.2 Why Redux Toolkit?
“Classic” Redux was verbose: action types, action creators, switch statements.
Redux Toolkit (RTK) is the modern way:

configureStore to set up store.

createSlice to define state + reducers in one place.

Uses Immer under the hood → you can “mutate” state in reducers, but it remains immutable.

Example slice:

ts
// store/cartSlice.ts
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] as Item[] },
  reducers: {
    addItem(state, action: PayloadAction<Item>) {
      state.items.push(action.payload); // allowed (Immer)
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
  },
});

export const { addItem, removeItem } = cartSlice.actions;
export default cartSlice.reducer;
3.3 When to Use Redux
Large or growing apps with complex global state:

Forms, entities, lists, pagination, filters, UI flags, etc.

Multiple developers / teams where:

You want a standard structure and predictable patterns.

You want serious debugging:

Redux DevTools: see all actions, time travel, inspect state over time.

3.4 Pros
Predictable: state changes are centralized and explicit.

Easy to test reducers and selectors.

Great devtools and ecosystem:

Middlewares: Thunk, Saga, RTK Query, etc.

Encourages clear separation of concerns (UI vs state).

3.5 Cons
More setup and mental model vs Context/Zustand.

Extra dependency and boilerplate (even though RTK reduces it a lot).

Overkill for very small/simple apps.

3.6 Mental Model
Redux is like a central government:
All changes go through official forms (actions) and offices (reducers), which is slower at first but gives strong order, logging, and traceability.

Use when you need structure + tooling + predictability, especially for big apps.

4. Zustand
4.1 What Is Zustand?
Zustand is a lightweight state management library that uses hooks and simple stores.

Key characteristics:

You create a store with create().

Store contains state + actions in one place.

Components use a hook (e.g. useStore) to select slices of state.

No actions/reducers/action types; you just call functions.

Example idea:

ts
// store/useCartStore.ts
const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter(i => i.id !== id) })),
}));

// in component
const items = useCartStore(state => state.items);
const addItem = useCartStore(state => state.addItem);
4.2 When to Use Zustand
Small to medium apps where Redux feels too heavy.

Feature-specific state:

A complex form

A dashboard

A cart

A wizard / stepper

You want global-ish state but with:

Very little boilerplate

A simple, hook‑based API

It fits particularly well when you already think in terms of custom hooks.

4.3 Pros
Very simple API; easy to introduce gradually.

Excellent performance:

Components subscribe only to selected slices, so fewer re‑renders.

You can create multiple stores for different domains (auth store, cart store, UI store).

Works well in TS projects; fits naturally with modern React.

4.4 Cons
Less “official” structure than Redux:

Easier to write messy code if the team is careless.

Smaller ecosystem & devtools compared to Redux (though there is decent support).

For huge teams, lack of strict patterns may be a downside.

4.5 Mental Model
Zustand is like a smart global object with subscriptions:
You define state + actions together, and components subscribe to exactly what they need via a hook.

Use when you want global state with minimal ceremony.

5. Axios
5.1 What Is Axios?
Axios is a promise‑based HTTP client for browsers and Node.js.

You use Axios to:

Send requests: GET, POST, PUT, DELETE, etc.

Send JSON or other data to server.

Receive responses and convert them to JS objects.

Handle errors, timeouts, interceptors.

Example:

ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
});

// interceptor example (attach token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// usage in component or service
const fetchTodos = async () => {
  const res = await api.get('/todos');
  return res.data;
};
5.2 What Axios Is NOT
Axios is not a state manager.

It only performs network requests.

After fetching data, you decide where to store it:

Local useState

Context

Redux store

Zustand store

5.3 Typical Flow with Axios + State Manager
Component or service calls Axios:

const data = await axios.get('/todos').

On success:

Save data to state (Context / Redux / Zustand).

Components subscribe to that state and render.

6. Putting It Together in a Real App
6.1 Example Architecture
Imagine a dashboard app:

Context API

AuthContext → user, token, login/logout

ThemeContext → light/dark, toggleTheme

Zustand or Redux

useDashboardStore or dashboardSlice:

filters, sort, pagination, selected items

useCartStore or cartSlice:

cart items, totals, coupon codes

useNotificationStore:

snackbars, toasts

Axios

api.ts file:

baseURL, interceptors for token & error logging

functions: fetchDashboardData, updateProfile, createOrder, etc.

These functions are called from:

components, or

async actions (Redux thunk / RTK Query) or Zustand actions

6.2 Example Flow
User opens Dashboard:

App wraps everything in AuthProvider and ThemeProvider.

On mount, some component calls fetchDashboardData() (Axios).

Response goes into:

dashboardStore.setState({ widgets: res.data.widgets }) (Zustand)

or dispatch(setWidgets(res.data.widgets)) (Redux slice)

UI reads from the store and renders cards, charts, etc.

User changes theme → ThemeContext toggles value → UI updates.

7. When to Choose What (Practical Guide)
7.1 Quick Decision Rules
Very small app / few global values
→ Start with Context API + local state.

You already feel Context is messy (too many providers, many values)
→ Introduce Zustand for global application or feature state.

Big product / team / complex flows
→ Use Redux (with Redux Toolkit) for:

Standardization

DevTools

Middlewares

Always use something like Axios or fetch for API calls.

Axios is convenient because of interceptors, baseURL, etc.

7.2 Recommended Learning Path
For a beginner building serious apps:

Master React basics:

useState, useReducer, prop drilling, lifting state up.

Learn Context API:

Implement AuthContext, ThemeContext, etc.

Learn Axios:

Build a small CRUD app that fetches and posts data.

Move to Zustand:

Refactor some global state from Context into a Zustand store.

When you want maximum structure & tooling:

Learn Redux Toolkit and compare with your Zustand solution.

8. Short Summary Cheat Sheet
Context API

Built‑in, simple, best for small global things (auth, theme, config).

Redux (RTK)

Heavy but powerful; best for large and complex apps that need strict patterns and great devtools.

Zustand

Lightweight and ergonomic; best when you want global state with minimal boilerplate.

Axios

HTTP client; use it alongside any of the above to talk to APIs and then store data wherever you like.