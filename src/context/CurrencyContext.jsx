import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const EXCHANGE_RATES = {
    USD: 1,
    LKR: 300,
    EUR: 0.92,
    GBP: 0.79,
    AUD: 1.52,
    CAD: 1.35
};

const CURRENCY_SYMBOLS = {
    USD: '$',
    LKR: 'Rs.',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$'
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        const saved = localStorage.getItem('ambrosia_currency');
        return saved || 'USD';
    });

    useEffect(() => {
        localStorage.setItem('ambrosia_currency', currency);
    }, [currency]);

    const convert = (amount) => {
        const rate = EXCHANGE_RATES[currency] || 1;
        return (amount * rate).toFixed(2);
    };

    const formatPrice = (amount) => {
        const converted = convert(amount);
        const symbol = CURRENCY_SYMBOLS[currency] || '$';
        return `${symbol}${converted}`;
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            formatPrice,
            convert,
            availableCurrencies: Object.keys(EXCHANGE_RATES),
            currencySymbols: CURRENCY_SYMBOLS
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};
