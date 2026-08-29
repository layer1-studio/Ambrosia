import React, { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Reveal = ({ children, className = '', delay = 0, as = 'div', stagger = false }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(prefersReducedMotion);

    useEffect(() => {
        const el = ref.current;
        if (!el || prefersReducedMotion()) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const Tag = as;
    return (
        <Tag
            ref={ref}
            className={`reveal ${stagger ? 'reveal-stagger' : ''} ${visible ? 'reveal-visible' : ''} ${className}`}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </Tag>
    );
};

export default Reveal;
