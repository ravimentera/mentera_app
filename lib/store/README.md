# API Calling Practices

All API calls must use RTK Query hooks for consistency and automatic caching.

## Structure
```
lib/store/
├── api/           # RTK Query API definitions
├── slices/        # Redux state management
├── types/         # TypeScript types
├── hooks/         # Typed Redux hooks
└── index.ts       # Store configuration
```

## ✅ Correct Usage

### API Calls
```typescript
import { useGetPatientsQuery, useCreatePatientMutation } from '@/lib/store/api';

function Component() {
  const { data, isLoading, error } = useGetPatientsQuery();
  const [createPatient] = useCreatePatientMutation();
  
  // Handles caching, loading states, error handling automatically
}
```

### State Management
```typescript
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setSearchQuery } from '@/lib/store/slices';

function Component() {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(state => state.search.query);
  
  dispatch(setSearchQuery('new query'));
}
```

## ❌ Don't Use
- Direct API service calls
- Manual fetch/axios calls
- Custom useApi hooks
- Direct RTK Query dispatch calls

## Adding New APIs

### 1. Create API Definition
```typescript
// lib/store/api/newFeatureApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const newFeatureApi = createApi({
  reducerPath: 'newFeatureApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/new-feature',
    prepareHeaders: (headers, { getState }) => {
      headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['NewFeature'],
  endpoints: (builder) => ({
    getItems: builder.query<Item[], void>({
      query: () => '',
      providesTags: ['NewFeature'],
    }),
    createItem: builder.mutation<Item, CreateItemRequest>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NewFeature'],
    }),
  }),
});

export const { useGetItemsQuery, useCreateItemMutation } = newFeatureApi;
```

### 2. Add to Store
```typescript
// lib/store/index.ts
import { newFeatureApi } from './api/newFeatureApi';

export const store = configureStore({
  reducer: {
    // ... existing reducers
    [newFeatureApi.reducerPath]: newFeatureApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // ... existing middleware
      newFeatureApi.middleware,
    ),
});
```

### 3. Export from API Index
```typescript
// lib/store/api/index.ts
export * from './newFeatureApi';
```

## Configuration Options

### Query Configuration
```typescript
const { data, isLoading, error } = useGetItemsQuery(undefined, {
  pollingInterval: 30000,     // Refetch every 30s
  refetchOnFocus: true,       // Refetch when window gains focus
  refetchOnReconnect: true,   // Refetch when reconnected
  skip: !shouldFetch,         // Conditionally skip query
});
```

### Mutation Configuration
```typescript
const [createItem, { 
  isLoading, 
  error, 
  isSuccess, 
  reset 
}] = useCreateItemMutation();

// With error handling
const handleCreate = async (data) => {
  try {
    await createItem(data).unwrap();
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

## Error Handling

### Basic Error Handling
```typescript
function Component() {
  const { data, isLoading, error } = useGetItemsQuery();
  
  if (isLoading) return <Loading />;
  if (error) {
    // error.status - HTTP status code
    // error.data - Server response
    return <ErrorMessage error={error} />;
  }
  
  return <div>{/* Success UI */}</div>;
}
```

### Advanced Mutation Error Handling
```typescript
function CreateForm() {
  const [createItem, { isLoading, error, reset }] = useCreateItemMutation();
  
  const handleSubmit = async (formData) => {
    try {
      reset(); // Clear previous errors
      const result = await createItem(formData).unwrap();
      toast.success('Item created successfully');
    } catch (err) {
      // Handle specific error types
      if (err.status === 400) {
        toast.error('Invalid data provided');
      } else if (err.status === 409) {
        toast.error('Item already exists');
      } else {
        toast.error('Something went wrong');
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorAlert error={error} />}
      {/* Form fields */}
    </form>
  );
}
```

### Global Error Handling
```typescript
// In your API definition
const baseQueryWithErrorHandling = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    // Add auth headers
    return headers;
  },
});

const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    const result = await baseQueryWithErrorHandling(args, api, extraOptions);
    
    // Handle global errors
    if (result.error?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    
    return result;
  },
  { maxRetries: 3 }
);
```

## Benefits
- Automatic caching & deduplication
- Built-in loading & error states
- Type safety
- Consistent patterns 