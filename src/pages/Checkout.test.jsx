import { render, screen, fireEvent } from '@testing-library/react';
import Checkout from '../pages/Checkout';
import { CartProvider } from '../context/CartContext';
import { CurrencyProvider } from '../context/CurrencyContext';
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
                <CurrencyProvider>
                    <Checkout />
                </CurrencyProvider>
            </BrowserRouter>
        );
        expect(screen.getByText('Checkout')).toBeInTheDocument();
        expect(screen.getByText(/Delivery Details/i)).toBeInTheDocument();
    });

    test('validates incomplete form submission', async () => {
        render(
            <BrowserRouter>
                <CurrencyProvider>
                    <Checkout />
                </CurrencyProvider>
            </BrowserRouter>
        );

        const form = screen.getByRole('button', { name: /Confirm Order/i }).closest('form');
        fireEvent.submit(form);

        expect(window.alert).toHaveBeenCalledWith('Kindly provide a valid email address.');
    });

    test('validates invalid email', () => {
        render(
            <BrowserRouter>
                <CurrencyProvider>
                    <Checkout />
                </CurrencyProvider>
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText('Email Address');
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

        const form = screen.getByRole('button', { name: /Confirm Order/i }).closest('form');
        fireEvent.submit(form);

        expect(window.alert).toHaveBeenCalledWith('Kindly provide a valid email address.');
    });

    test('validates missing required fields', () => {
        render(
            <BrowserRouter>
                <CurrencyProvider>
                    <Checkout />
                </CurrencyProvider>
            </BrowserRouter>
        );

        // Fill email correctly but leave others empty
        fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'test@example.com' } });

        const form = screen.getByRole('button', { name: /Confirm Order/i }).closest('form');
        fireEvent.submit(form);

        // Expect alert for missing fields
        expect(window.alert).toHaveBeenCalledWith('Please complete all required fields for delivery.');
    });
});
