import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { render, screen, cleanup, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import App from '../../src/App.jsx';
import { AdoptionProvider, useAdoption } from '../../src/context/AdoptionContext.jsx';
import { createInitialAdoptionState } from '../../src/context/adoptionState.js';
import PetFormPage from '../../src/pages/PetFormPage.jsx';
import DashboardPage from '../../src/pages/DashboardPage.jsx';
import Navbar from '../../src/components/Navbar.jsx';

afterEach(cleanup);
const start = (route = '/dashboard') => render(<MemoryRouter initialEntries={[route]}><App/></MemoryRouter>);
 
 
function SessionControls() {
  const { setCurrentUser } = useAdoption();
  return <div aria-label="Test session controls">
    <button onClick={() => setCurrentUser(null)}>Test sign out</button>
    <button onClick={() => setCurrentUser('user-002')}>Test Sam</button>
    <button onClick={() => setCurrentUser('user-004')}>Test shelter</button>
  </div>;
}
function startAs(id, state = createInitialAdoptionState(id)) {
  return render(<MemoryRouter initialEntries={['/dashboard']}>
    <AdoptionProvider initialState={state}>
      <SessionControls/><Navbar/>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage/>}/>
        <Route path="/pets/new" element={<PetFormPage/>}/>
        <Route path="/pets/:id/edit" element={<PetFormPage/>}/>
      </Routes>
    </AdoptionProvider>
  </MemoryRouter>);
}


test('dashboard tabs, filtering, sent requests, received requests, empty account and theme', async () => {
  const user = userEvent.setup(); start();
  assert.ok(screen.getByRole('heading', { name: /good things start/i }));
  assert.equal(screen.getAllByRole('article').length, 3);
  await user.type(screen.getByRole('searchbox'), 'maple');
  assert.equal(screen.getAllByRole('article').length, 1);
  await user.clear(screen.getByRole('searchbox'));
  await user.selectOptions(screen.getByLabelText('Filter by status'), 'adopted');
  assert.ok(screen.getByRole('heading', { name: 'Luna' }));
  await user.click(screen.getByRole('button', { name: /my requests/i }));
  assert.equal(screen.getAllByRole('article').length, 4);
  assert.ok(screen.getByText(/Your adoption is confirmed/i));
  await user.click(screen.getByRole('button', { name: /received requests/i }));
  assert.equal(screen.getAllByRole('article').length, 6);
  await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
  assert.ok(document.documentElement.classList.contains('dark'));
  cleanup(); startAs('user-008');
  assert.ok(screen.getByRole('heading', { name: /Their next chapter starts/i }));
  assert.ok(screen.getByRole('link', { name: 'My dashboard' }));
  assert.equal(screen.queryByRole('link', { name: 'Home', exact: true }), null);
  assert.equal(screen.queryByRole('link', { name: 'Find a friend', exact: true }), null);
  await user.click(screen.getByRole('button', { name: 'Test sign out' }));
  assert.equal(screen.queryByRole('link', { name: 'My dashboard' }), null);
  assert.equal(screen.queryByRole('link', { name: 'Dashboard', exact: true }), null);
  await user.click(screen.getByRole('button', { name: 'Test Sam' }));
  assert.ok(screen.getByRole('link', { name: 'My dashboard' }));
  assert.ok(screen.getByText('Sam Rivera', { selector: 'p' }));

});

test('add form validation, live preview, publish, edit prefill, saved dashboard state', async () => {
  const user = userEvent.setup(); start('/pets/new');
  await user.click(screen.getByRole('button', { name: 'Publish listing' }));
  assert.equal(screen.getByLabelText(/Pet’s name/).getAttribute('aria-invalid'), 'true');
  await user.type(screen.getByLabelText(/Pet’s name/), 'Poppy');
  await user.type(screen.getByLabelText('Age in months', { exact: false }), '15');
  await user.type(screen.getByLabelText('Meet your pet', { exact: false }), 'Poppy is a gentle companion who loves walks and quiet evenings with her people.');
  assert.ok(screen.getByRole('heading', { name: 'Poppy' }));
  await user.click(screen.getByRole('button', { name: 'Publish listing' }));
  assert.ok(screen.getByRole('status').textContent.includes('Poppy'));
  const card = screen.getByRole('heading', { name: 'Poppy' }).closest('article');
  await user.click(within(card).getByRole('link', { name: 'Edit listing' }));
  assert.equal(screen.getByLabelText(/Pet’s name/).value, 'Poppy');
  assert.equal(screen.getByLabelText('Age in months', { exact: false }).value, '15');
  await user.clear(screen.getByLabelText(/Pet’s name/));
  await user.type(screen.getByLabelText(/Pet’s name/), 'Poppy Rose');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  assert.ok(screen.getByRole('heading', { name: 'Poppy Rose' }));
  assert.ok(screen.getByRole('status').textContent.includes('updated'));
});

test('adoption confirmation rejects competing requests and marks own pet adopted', async () => {
  const user = userEvent.setup(); start();
  await user.click(screen.getByRole('button', { name: /received requests/i }));
  const mapleRequests = screen.getAllByRole('article').filter((item) => within(item).queryByRole('link', { name: 'Maple' }));
  assert.equal(mapleRequests.length, 2);
  await user.click(within(mapleRequests[0]).getByRole('button', { name: 'Approve adoption' }));
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirm adoption' }));
  const updated = screen.getAllByRole('article').filter((item) => within(item).queryByRole('link', { name: 'Maple' }));
  assert.equal(updated.filter((item) => /approved/.test(item.textContent)).length, 1);
  assert.equal(updated.filter((item) => /rejected/.test(item.textContent)).length, 1);
  await user.click(screen.getByRole('button', { name: /my listings/i }));
  assert.ok(screen.getByRole('heading', { name: 'Maple' }).closest('article').textContent.includes('adopted'));
});

test('delete confirms, removes listing and associated received requests', async () => {
  const user = userEvent.setup(); start();
  await user.click(screen.getByRole('button', { name: "Remove Maple's listing" }));
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove listing' }));
  assert.equal(screen.queryByRole('heading', { name: 'Maple' }), null);
  await user.click(screen.getByRole('button', { name: /received requests/i }));
  assert.equal(screen.getAllByRole('article').length, 4);
  assert.equal(screen.queryByRole('link', { name: 'Maple' }), null);
});

test('cancel protects dirty form and supports returning to dashboard', async () => {
  const user = userEvent.setup(); start('/pets/new');
  await user.type(screen.getByLabelText(/Pet’s name/), 'Unsaved');
  await user.click(screen.getByRole('button', { name: 'Back to dashboard', exact: true }));
  assert.ok(screen.getByRole('dialog'));
  await user.click(screen.getByRole('button', { name: 'Keep it' }));
  assert.equal(screen.getByLabelText(/Pet’s name/).value, 'Unsaved');
  await user.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
  await user.click(screen.getByRole('button', { name: 'Discard changes' }));
  assert.ok(screen.getByRole('heading', { name: /good things start/i }));
});

test('missing pet, foreign edit, guest state and shelter region lock', async () => {
  const user = userEvent.setup(); start('/pets/does-not-exist/edit');
  assert.ok(screen.getByRole('heading', { name: /couldn’t be found/i })); cleanup();
  start('/pets/pet-004/edit');
  assert.ok(screen.getByRole('heading', { name: /another lister/i })); cleanup();
  render(<MemoryRouter initialEntries={['/pets/new']}><AdoptionProvider initialState={createInitialAdoptionState(null)}><Routes><Route path="/pets/new" element={<PetFormPage/>}/></Routes></AdoptionProvider></MemoryRouter>);
  assert.ok(screen.getByRole('link', { name: 'Go to login' })); cleanup();
  startAs('user-004');
  await user.click(within(screen.getByRole('banner')).getByRole('link', { name: 'List a pet', exact: true }));
  assert.equal(screen.getByLabelText('Region', { exact: false }).value, 'central');
  assert.ok(screen.getByLabelText('Region', { exact: false }).disabled);
});


test('header opens the pet form while workspace and hero labels stay non-interactive', async () => {
  const user = userEvent.setup(); start();
  const workspace = within(screen.getByRole('complementary'));
  assert.ok(workspace.getByRole('heading', { name: 'Dashboard', exact: true }));
  assert.equal(workspace.queryByRole('link', { name: 'Dashboard', exact: true }), null);
  assert.equal(workspace.queryByRole('button', { name: 'Dashboard', exact: true }), null);
  assert.equal(workspace.queryByRole('link', { name: 'List a pet', exact: true }), null);
  assert.equal(screen.getByText('Little paws. Big love.').closest('a,button'), null);
  const listingLink = within(screen.getByRole('banner')).getByRole('link', { name: 'List a pet', exact: true });
  await user.click(listingLink);
  assert.ok(screen.getByRole('heading', { name: 'Help them find their people.' }));
  assert.equal(screen.queryByRole('complementary', { name: 'Dashboard sidebar' }), null);
  assert.equal(screen.queryByLabelText('Demo account'), null);
  await user.click(screen.getByRole('button', { name: 'Back to dashboard', exact: true }));
  assert.ok(screen.getByRole('heading', { name: /good things start/i }));
  assert.ok(screen.getByRole('complementary', { name: 'Dashboard sidebar' }));
  assert.equal(screen.queryByLabelText('Demo account'), null);
  assert.ok(screen.getByText('Alex Morgan', { selector: 'p' }));
});


test('sidebar follows the logged-in profile, falls back from a broken photo, and has no account switcher', async () => {
  const user = userEvent.setup();
  const state = createInitialAdoptionState('user-002');
  state.users = state.users.map((item) => item.id === 'user-002' ? { ...item, avatarUrl: '/images/mock/cat.svg' } : item);
  startAs('user-002', state);
  const sidebar = within(screen.getByRole('complementary', { name: 'Dashboard sidebar' }));
  assert.ok(sidebar.getByText('Sam Rivera', { selector: 'p' }));
  const avatar = sidebar.getByRole('img', { name: "Sam Rivera's profile" });
  assert.equal(avatar.tagName, 'IMG');
  assert.equal(avatar.getAttribute('src'), '/images/mock/cat.svg');
  fireEvent.error(avatar);
  assert.equal(sidebar.getByRole('img', { name: "Sam Rivera's profile" }).textContent, 'SR');
  assert.equal(sidebar.queryByRole('combobox'), null);
  assert.equal(sidebar.queryByText('Demo account'), null);
  await user.click(screen.getByRole('button', { name: 'Test shelter' }));
  assert.ok(sidebar.getByText('Jordan Lee', { selector: 'p' }));
  assert.ok(sidebar.getByText('Shelter account'));
  assert.equal(sidebar.queryByText('Sam Rivera', { selector: 'p' }), null);
  await user.click(screen.getByRole('button', { name: 'Test sign out' }));
  assert.equal(sidebar.queryByText('Jordan Lee', { selector: 'p' }), null);
  assert.ok(sidebar.getByText('Guest'));
  assert.equal(screen.queryByRole('link', { name: 'My dashboard' }), null);
});


test('dashboard navigation reaches the shared pet list and pet details routes', async () => {
  const user = userEvent.setup(); start();
  const browse = screen.getByRole('link', { name: 'Meet more pets' });
  assert.equal(browse.getAttribute('href'), '/pets');
  await user.click(browse);
  assert.ok(screen.getByRole('heading', { name: 'Pet List', exact: true }));
  cleanup(); start();
  const details = screen.getByRole('link', { name: 'View Clover', exact: true });
  assert.equal(details.getAttribute('href'), '/pets/pet-003');
  await user.click(details);
  assert.ok(screen.getByRole('heading', { name: 'Pet Details', exact: true }));
});


test('species selection updates the matching pet illustration previews', async () => {
  const user = userEvent.setup(); start('/pets/new');
  const species = screen.getByLabelText('Species', { exact: false });
  await user.selectOptions(species, 'bird');
  assert.equal(screen.getByRole('img', { name: 'Preview of your pet' }).getAttribute('src'), '/images/mock/bird-friendly.webp');
  await user.selectOptions(species, 'other');
  assert.equal(screen.getByRole('img', { name: 'Preview of your pet' }).getAttribute('src'), '/images/mock/unknown-animal.webp');
  await user.selectOptions(species, 'cat');
  assert.equal(screen.getByRole('img', { name: 'Preview of your pet' }).getAttribute('src'), '/images/mock/cat-friendly.webp');
  await user.selectOptions(species, 'dog');
  assert.equal(screen.getByRole('img', { name: 'Preview of your pet' }).getAttribute('src'), '/images/mock/dog-friendly.webp');
});


test('listing feedback floats outside the page, disappears after two seconds, and can be closed manually', async () => {
  const user = userEvent.setup();
  const entry = { pathname: '/dashboard', state: { notice: 'Maple’s listing was updated.' } };
  start('/pets/pet-001/edit');
  const shownAt = performance.now();
  await user.click(screen.getByRole('button', { name: 'Save changes', exact: true }));
  const popup = screen.getByRole('status');
  assert.ok(popup.textContent.includes('Maple’s listing was updated.'));
  assert.ok(popup.querySelector('.paws-toast-icon'));
  assert.equal(popup.classList.contains('bg-sky-50'), false);
  assert.equal(popup.parentElement, document.body);
  assert.equal(popup.getAttribute('aria-live'), 'polite');
  assert.equal(within(screen.getByRole('main')).queryByRole('status'), null);
  await user.type(screen.getByRole('searchbox'), 'Maple');
  await waitFor(() => assert.equal(Boolean(screen.queryByRole('status')), false), { timeout: 2800 });
  assert.ok(performance.now() - shownAt >= 1900, 'notification should remain visible for about two seconds');
  assert.ok(screen.getByRole('heading', { name: 'Maple', exact: true }));
  cleanup();
  start(entry);
  await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
  assert.equal(screen.queryByRole('status'), null);
});
