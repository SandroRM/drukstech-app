# list

Scrollable list with custom item rendering.

- **items**: `T[]` - Data array
- **renderItem**: `(item: T, index: number) => ReactNode` - Item renderer
- **keyExtractor**: `(item: T) => string` (optional)

```jsx
<list items={todos} renderItem={(todo) => <Text>{todo.title}</Text>} />
```
