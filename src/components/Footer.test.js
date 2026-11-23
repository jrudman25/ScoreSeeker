import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import packageJson from '../../package.json';

describe('Footer Component', () => {
    it('renders the app name and package version inside a footer element', () => {
        render(<Footer />);

        const footer = screen.getByRole('contentinfo');
        expect(footer).toBeInTheDocument();
        expect(footer).toHaveTextContent(`ScoreSeeker v${packageJson.version}`);
    });

    it('links to TheSportsDB with safe external attributes', () => {
        render(<Footer />);

        const link = screen.getByRole('link', { name: 'TheSportsDB' });
        expect(link).toHaveAttribute('href', 'https://www.thesportsdb.com');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
