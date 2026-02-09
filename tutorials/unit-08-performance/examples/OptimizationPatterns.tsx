// Unit 8 Example: Performance Optimization Patterns
// Demonstrates React.memo, useMemo, useCallback

import { useState, memo, useMemo, useCallback, lazy, Suspense } from 'react';

// ============================================
// React.memo Example
// ============================================

interface ExpensiveItemProps {
    item: { id: number; name: string };
    onSelect: (id: number) => void;
}

// Without memo: re-renders every time parent renders
function ExpensiveItemBad({ item, onSelect }: ExpensiveItemProps) {
    console.log(`Rendering item: ${item.name}`);
    return (
        <li onClick={() => onSelect(item.id)}>
            {item.name}
        </li>
    );
}

// With memo: only re-renders if props change
const ExpensiveItemGood = memo(function ExpensiveItem({
    item,
    onSelect,
}: ExpensiveItemProps) {
    console.log(`Rendering item: ${item.name}`);
    return (
        <li onClick={() => onSelect(item.id)}>
            {item.name}
        </li>
    );
});

// ============================================
// useMemo Example
// ============================================

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
}

function ProductFilter({ products }: { products: Product[] }) {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
    const [minPrice, setMinPrice] = useState(0);

    // ❌ Bad: Recalculates on every render
    const filteredBad = products
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        .filter((p) => p.price >= minPrice)
        .sort((a, b) => (sortBy === 'price' ? a.price - b.price : a.name.localeCompare(b.name)));

    // ✅ Good: Only recalculates when dependencies change
    const filteredGood = useMemo(() => {
        console.log('Filtering and sorting products...');
        return products
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
            .filter((p) => p.price >= minPrice)
            .sort((a, b) =>
                sortBy === 'price' ? a.price - b.price : a.name.localeCompare(b.name)
            );
    }, [products, search, sortBy, minPrice]);

    return (
        <div>
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
            </select>
            <input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
            />
            <ul>
                {filteredGood.map((p) => (
                    <li key={p.id}>
                        {p.name} - ${p.price}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ============================================
// useCallback Example
// ============================================

function ParentWithCallback() {
    const [count, setCount] = useState(0);
    const [text, setText] = useState('');

    // ❌ Bad: New function every render, breaks child memo
    const handleClickBad = () => {
        console.log('Clicked!');
    };

    // ✅ Good: Stable function reference
    const handleClickGood = useCallback(() => {
        console.log('Clicked!');
    }, []);

    // ✅ Good with dependency: Only changes when count changes
    const handleIncrement = useCallback(() => {
        setCount((c) => c + 1);
    }, []);

    return (
        <div>
            <input value={text} onChange={(e) => setText(e.target.value)} />
            <p>Count: {count}</p>
            <ExpensiveButton onClick={handleClickGood} label="Click me" />
            <ExpensiveButton onClick={handleIncrement} label="Increment" />
        </div>
    );
}

const ExpensiveButton = memo(function ExpensiveButton({
    onClick,
    label,
}: {
    onClick: () => void;
    label: string;
}) {
    console.log(`Rendering button: ${label}`);
    return <button onClick={onClick}>{label}</button>;
});

// ============================================
// Code Splitting Example
// ============================================

// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));
const AdminPanel = lazy(() => import('./AdminPanel'));

function Dashboard({ isAdmin }: { isAdmin: boolean }) {
    return (
        <div>
            <h1>Dashboard</h1>

            {/* Chart loads only when needed */}
            <Suspense fallback={<div>Loading chart...</div>}>
                <HeavyChart />
            </Suspense>

            {/* Admin panel only loads for admins */}
            {isAdmin && (
                <Suspense fallback={<div>Loading admin panel...</div>}>
                    <AdminPanel />
                </Suspense>
            )}
        </div>
    );
}

// ============================================
// Combined Example
// ============================================

interface Item {
    id: number;
    name: string;
}

export function OptimizedList() {
    const [items] = useState<Item[]>([
        { id: 1, name: 'Item A' },
        { id: 2, name: 'Item B' },
        { id: 3, name: 'Item C' },
    ]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [otherState, setOtherState] = useState(0);

    // ✅ Stable callback - child won't re-render when otherState changes
    const handleSelect = useCallback((id: number) => {
        setSelectedId(id);
    }, []);

    return (
        <div>
            <h2>Optimized List</h2>
            <button onClick={() => setOtherState((s) => s + 1)}>
                Update other state: {otherState}
            </button>
            <p>Selected: {selectedId}</p>
            <ul>
                {items.map((item) => (
                    <ExpensiveItemGood
                        key={item.id}
                        item={item}
                        onSelect={handleSelect}
                    />
                ))}
            </ul>
        </div>
    );
}

export default OptimizedList;
