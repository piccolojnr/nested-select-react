# Nested Select React

A flexible, accessible nested select component for React applications that allows users to navigate and select from hierarchical data.

## Installation

```bash
npm install nested-select-react
# or
yarn add nested-select-react
```

## Usage

```jsx
import { NestedSelect } from 'nested-select-react';

// Your hierarchical data
const categories = [
  {
    id: '1',
    name: 'Electronics',
    children: [
      {
        id: '1-1',
        name: 'Computers',
        children: [
          { id: '1-1-1', name: 'Laptops' },
          { id: '1-1-2', name: 'Desktops' }
        ]
      },
      { id: '1-2', name: 'Smartphones' }
    ]
  },
  {
    id: '2',
    name: 'Clothing',
    children: [
      { id: '2-1', name: 'Men' },
      { id: '2-2', name: 'Women' }
    ]
  }
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelect = (category) => {
    setSelectedCategory(category);
    console.log('Selected:', category);
  };

  return (
    <div>
      <h1>Product Category</h1>
      <NestedSelect
        items={categories}
        selectedItemId={selectedCategory?.id}
        onSelect={handleSelect}
        placeholder="Select a category..."
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | array | required | Array of hierarchical items |
| selectedItemId | string/number | null | ID of the currently selected item |
| onSelect | function | required | Callback when an item is selected |
| idKey | string | 'id' | Key to use for item IDs |
| labelKey | string | 'name' | Key to use for item labels |
| childrenKey | string | 'children' | Key to use for item children |
| placeholder | string | 'Select an item...' | Placeholder text when no item is selected |
| maxHeight | string/number | '15rem' | Maximum height of the dropdown menu |
| className | string | '' | Additional CSS classes for the component |
| dropdownClassName | string | '' | Additional CSS classes for the dropdown |
| showSelectAll | boolean | true | Whether to show the "Select All" button |
| showBreadcrumb | boolean | true | Whether to show the breadcrumb navigation |
| renderItem | function | - | Custom renderer for items |
| renderTrigger | function | - | Custom renderer for the trigger button |
| renderBreadcrumb | function | - | Custom renderer for breadcrumb navigation |
| renderEmpty | function | - | Custom renderer for empty state |
| disableItem | function | - | Function to determine if an item should be disabled |
| filterItems | function | - | Function to filter items when searching |
| searchPlaceholder | string | 'Search...' | Placeholder text for the search input |

## License

MIT