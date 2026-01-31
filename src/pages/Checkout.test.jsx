import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Checkout from '../pages/Checkout';
import { CartProvider } from '../context/CartContext';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock dependencies
vi.mock('../context/CartContext', async () => {
    const actual = await vi.importActual('../context/CartContext');
    return {
        ...actual,
        useCart: () => ({
            cartItems: [{ id: 1, name: 'Product', price: 10, quantity: 1 }],
            cartTotal: 10,
            clearCart: vi.fn(),
        }),
    };
});

window.alert = vi.fn();

describe('Checkout Page', () => {
    test('renders checkout form', () => {
        render(
            <BrowserRouter>
                <Checkout />
            </BrowserRouter>
        );
        expect(screen.getByText('Checkout')).toBeInTheDocument();
        expect(screen.getByText(/Shipping Information/i)).toBeInTheDocument();
    });

    test('validates incomplete form submission', async () => {
        render(
            <BrowserRouter>
                <Checkout />
            </BrowserRouter>
        );

        const form = screen.getByRole('button', { name: /Place Order/i }).closest('form');
        fireEvent.submit(form);

        expect(window.alert).toHaveBeenCalledWith('Please enter a valid email address.');
    });

    test('validates invalid email', () => {
        render(
            <BrowserRouter>
                <Checkout />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText('Email Address');
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

        const form = screen.getByRole('button', { name: /Place Order/i }).closest('form');
        fireEvent.submit(form);

        expect(window.alert).toHaveBeenCalledWith('Please enter a valid email address.');
    });

    test('validates missing required fields', () => {
        render(
            <BrowserRouter>
                <Checkout />
            </BrowserRouter>
        );

        // Fill email correctly but leave others empty
        fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'test@example.com' } });

        const form = screen.getByRole('button', { name: /Place Order/i }).closest('form');
        fireEvent.submit(form);

        // Expect alert for missing fields
        expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields.');
    });
});
