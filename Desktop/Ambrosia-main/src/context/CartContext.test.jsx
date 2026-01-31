import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import { useEffect } from 'react';

// Test Component to consume the context
const TestComponent = () => {
    const { cartItems, addToCart, removeFromCart, clearCart, cartTotal } = useCart();

    return (
        <div>
            <div data-testid="cart-total">{cartTotal}</div>
            <div data-testid="cart-count">{cartItems.length}</div>
            <button onClick={() => addToCart({ id: 1, name: 'Cinnamon', price: 10 })} data-testid="add-btn">Add</button>
            <button onClick={() => removeFromCart(1)} data-testid="remove-btn">Remove</button>
            <button onClick={() => clearCart()} data-testid="clear-btn">Clear</button>
        </div>
    );
};

describe('CartContext', () => {
    test('provides initial empty state', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });

    test('adds item to cart and updates total', async () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        const addBtn = screen.getByTestId('add-btn');
        await act(async () => {
            addBtn.click();
        });

        expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
        expect(screen.getByTestId('cart-total')).toHaveTextContent('10');
    });

    test('removes item from cart', async () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        const addBtn = screen.getByTestId('add-btn');
        const removeBtn = screen.getByTestId('remove-btn');

        await act(async () => {
            addBtn.click();
        });
        expect(screen.getByTestId('cart-count')).toHaveTextContent('1');

        await act(async () => {
            removeBtn.click();
        });
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });

    test('clears cart', async () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        const addBtn = screen.getByTestId('add-btn');
        const clearBtn = screen.getByTestId('clear-btn');

        await act(async () => {
            addBtn.click();
            addBtn.click();
        });
        expect(screen.getByTestId('cart-total')).toHaveTextContent('20');

        await act(async () => {
            clearBtn.click();
        });
        expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });
});
