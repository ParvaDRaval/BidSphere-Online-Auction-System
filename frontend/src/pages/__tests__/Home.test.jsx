import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';
import { vi } from 'vitest';

// Mock the api
vi.mock('../../api', () => ({
  listAuctions: vi.fn(),
}));

// Mock ExploreCategories to avoid rendering its internal complexity
vi.mock('../ExploreCategories', () => ({
  __esModule: true,
  default: () => React.createElement('div', {}, 'ExploreCategoriesMock'),
}));

import { listAuctions } from '../../api';

function deferred() {
  let resolve;
  const p = new Promise((res) => { resolve = res; });
  return { p, resolve };
}

describe('Home page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders static hero and featured section when no auctions', async () => {
    listAuctions.mockResolvedValue({ auctions: [] });
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // static hero content
    expect(screen.getByText(/Where Buyers & Sellers Meet/i)).toBeDefined();
    expect(screen.getByText(/Discover everything from everyday finds/i)).toBeDefined();

    // Featured section header
    expect(screen.getByText(/Featured Live Auctions/i)).toBeDefined();

    // ExploreCategories mock present
    expect(screen.getByText('ExploreCategoriesMock')).toBeDefined();

    // Wait for useEffect to finish and show empty placeholders (dashed yellow boxes)
    await waitFor(() => {
      const empties = container.querySelectorAll('.border-dashed');
      expect(empties.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows loading placeholders while fetching featured auctions', async () => {
    const d = deferred();
    listAuctions.mockReturnValue(d.p);
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // while promise pending, featuredLoading true -> skeletons with bg-gray-200 present
    const loaders = container.querySelectorAll('.bg-gray-200');
    expect(loaders.length).toBeGreaterThanOrEqual(1);

    // resolve with empty data and wait for loaders to go away
    d.resolve({ auctions: [] });
    await waitFor(() => {
      const loadersAfter = container.querySelectorAll('.bg-gray-200');
      expect(loadersAfter.length).toBe(0);
    });
  });

  it('renders auctions list with images, badges and starting price', async () => {
    const auctions = [
      {
        _id: '1',
        title: 'Antique Vase',
        item: { name: 'Vase', images: ['http://example.com/vase.jpg'], category: 'Decor' },
        startingPrice: 500,
        endTime: '2025-12-01T12:00:00.000Z',
        status: 'LIVE',
      },
      {
        _id: '2',
        title: 'Old Clock',
        item: { name: 'Clock', images: ['filename.jpg'], category: 'Collectibles' },
        startingPrice: 1200,
        endTime: '2025-12-05T15:30:00.000Z',
        status: 'YET_TO_BE_VERIFIED',
      },
      {
        _id: '3',
        title: '',
        item: { name: 'Unknown', images: [], category: 'Misc' },
        startingPrice: 0,
        endTime: null,
        status: 'CANCELLED',
      },
    ];

    listAuctions.mockResolvedValue({ auctions });

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for auctions to render
    await waitFor(() => expect(container.querySelectorAll('a[href^="/auction/"]').length).toBeGreaterThanOrEqual(1));

    // Check first auction image rendered (http URL)
    const img = container.querySelector('img[alt="Vase"]');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toContain('http://example.com/vase.jpg');

    // Check starting price displayed
    expect(container.textContent).toContain('Starting: ₹500');

    // Check badge texts for statuses
    expect(container.textContent).toContain('LIVE');
    expect(container.textContent).toContain('YET_TO_BE_VERIFIED');
    expect(container.textContent).toContain('CANCELLED');

    // For auction with no image, 'No image' should be present for at least one card
    expect(container.textContent).toContain('No image');
  });

  it('covers all status badge branches and default case', async () => {
    const auctions = [
      { _id: 's1', title: 'A1', item: { name: 'I1', images: ['http://x/a.jpg'], category: 'C1' }, startingPrice: 10, endTime: '2025-12-01T12:00:00.000Z', status: 'LIVE' },
      { _id: 's2', title: 'A2', item: { name: 'I2', images: ['filename.jpg'], category: 'C2' }, startingPrice: 20, endTime: null, status: 'UPCOMING' },
      { _id: 's3', title: 'A3', item: { name: 'I3', images: [], category: 'C3' }, startingPrice: 30, endTime: null, status: 'ENDED' },
      { _id: 's4', title: 'A4', item: { name: 'I4', images: [], category: 'C4' }, startingPrice: 40, endTime: null, status: 'CANCELLED' },
      { _id: 's5', title: 'A5', item: { name: 'I5', images: [], category: 'C5' }, startingPrice: 50, endTime: null, status: 'REMOVED' },
      { _id: 's6', title: 'A6', item: { name: 'I6', images: [], category: 'C6' }, startingPrice: 60, endTime: null, status: 'YET_TO_BE_VERIFIED' },
      { _id: 's7', title: 'A7', item: { name: 'I7', images: [], category: 'C7' }, startingPrice: 70, endTime: null, status: 'SOMETHING' },
    ];

    listAuctions.mockResolvedValue({ auctions });
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => expect(container.querySelectorAll('a[href^="/auction/"]').length).toBeGreaterThanOrEqual(1));

    // Assert badges text present for each status
    expect(container.textContent).toContain('LIVE');
    expect(container.textContent).toContain('UPCOMING');
    expect(container.textContent).toContain('ENDED');
    expect(container.textContent).toContain('CANCELLED');
    expect(container.textContent).toContain('REMOVED');
    expect(container.textContent).toContain('YET_TO_BE_VERIFIED');
    // default (unknown) should render too
    expect(container.textContent).toContain('SOMETHING');

    // Check that http image was used for first auction
    const img = container.querySelector('img[alt="I1"]');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toContain('http://x/a.jpg');

    // filename.jpg should not be treated as full URL and will show 'No image' placeholder for that card
    expect(container.textContent).toContain('No image');
  });

  it('handles leading-slash images and title fallback', async () => {
    const auctions = [
      {
        _id: 'slash-1',
        title: null,
        item: { name: 'SlashItem', images: ['/images/pic.jpg'], category: 'Slash' },
        startingPrice: 99,
        endTime: null,
        status: 'LIVE',
      },
      {
        _id: 'untitled-1',
        title: null,
        item: { name: null, images: [], category: 'Misc' },
        startingPrice: null,
        endTime: null,
        status: 'SOMETHING',
      },
    ];

    listAuctions.mockResolvedValue({ auctions });

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // wait for auctions to render as links
    await waitFor(() => expect(container.querySelectorAll('a[href^="/auction/"]').length).toBeGreaterThanOrEqual(1));

    // leading-slash image should be used as src and alt should be item name
    const img = container.querySelector('img[alt="SlashItem"]');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/images/pic.jpg');

    // second auction has no title and no item.name -> component should show fallback title
    expect(container.textContent).toContain('Untitled Auction');

    // LIVE badge should have green classes
    const liveBadge = screen.getByText('LIVE');
    expect(liveBadge).toHaveClass('bg-green-100');
  });

  it('handles fetch error and ensures loading toggles off', async () => {
    // make listAuctions reject to trigger catch/finally
    listAuctions.mockRejectedValue(new Error('network')); 
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // While promise pending, loaders show
    const loaders = container.querySelectorAll('.bg-gray-200');
    expect(loaders.length).toBeGreaterThanOrEqual(1);

    // Wait for effect to settle and loading to go false (so placeholders become empty dashed boxes)
    await waitFor(() => {
      const empties = container.querySelectorAll('.border-dashed');
      expect(empties.length).toBeGreaterThanOrEqual(1);
    });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('renders image when src starts with a slash and covers that branch', async () => {
    const auctions = [
      {
        _id: 'slash-1',
        title: 'Slash Img',
        item: { name: 'SlashItem', images: ['/static/img.jpg'], category: 'Slash' },
        startingPrice: 99,
        endTime: '2025-11-20T12:00:00.000Z',
        status: 'LIVE',
      },
    ];

    listAuctions.mockResolvedValue({ auctions });

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => expect(container.querySelectorAll('a[href^="/auction/"]').length).toBeGreaterThanOrEqual(1));

    const img = container.querySelector('img[alt="SlashItem"]');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/static/img.jpg');
  });

  it('explicitly exercises fetchFeatured loading true->false path', async () => {
    // create a deferred promise so we can assert loading state while pending
    const d = deferred();
    listAuctions.mockReturnValue(d.p);

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // while the promise is pending, the component should show loading placeholders
    const loaders = container.querySelectorAll('.bg-gray-200');
    expect(loaders.length).toBeGreaterThanOrEqual(1);

    // now resolve the promise and ensure loaders are removed (finally branch ran)
    d.resolve({ auctions: [] });
    await waitFor(() => {
      const loadersAfter = container.querySelectorAll('.bg-gray-200');
      expect(loadersAfter.length).toBe(0);
    });
  });

  // --- UPDATED TEST CASE FOR LINE 80 (unmount) COVERAGE ---
  it('returns early if component unmounts before fetch resolves', async () => {
    const d = deferred();
    listAuctions.mockReturnValue(d.p);

    const { container, unmount } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // ensure loaders are present while pending
    expect(container.querySelectorAll('.bg-gray-200').length).toBeGreaterThanOrEqual(1);

    // unmount before resolving to trigger the `if (!mounted) return` branch
    unmount();

    // resolve after unmount; should not throw
    d.resolve({ auctions: [{ _id: 'x', item: { name: 'X', images: [] } }] });

    // CRITICAL UPDATE: 
    // Use a real delay to allow the microtask queue to flush and the 
    // async function inside useEffect to resume execution up to the return statement.
    // Simple Promise.resolve() is often insufficient for coverage tools here.
    await new Promise((r) => setTimeout(r, 0));
  });

  it('renders fallback badge text and category when fields missing', async () => {
    const auctions = [
      { _id: 'f1', title: null, item: { name: null, images: [] }, startingPrice: null, endTime: null, status: undefined },
      { _id: 'f2', title: 'HasCat', item: { name: 'Name', images: ['http://a/b.jpg'], category: undefined }, startingPrice: 1, endTime: null, status: 'LIVE' }
    ];

    listAuctions.mockResolvedValue({ auctions });

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => expect(container.querySelectorAll('a[href^="/auction/"]').length).toBeGreaterThanOrEqual(1));

    // first auction should show fallback title and N/A badge
    expect(container.textContent).toContain('Untitled Auction');
    expect(container.textContent).toContain('N/A');

    // second auction has undefined category -> should fall back to 'Category'
    expect(container.textContent).toContain('Category');
  });
});
