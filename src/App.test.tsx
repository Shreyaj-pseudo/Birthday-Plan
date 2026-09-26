import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { birthday } from './content';
import { VideoPlayer } from './VideoPlayer';
vi.mock('./Cake', () => ({ default: () => <div>3D cake</div> }));
beforeEach(() => { cleanup(); localStorage.clear(); window.matchMedia = vi.fn().mockImplementation((query: string) => ({matches:query.includes('reduced-motion'),addEventListener:vi.fn(),removeEventListener:vi.fn()})); vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(() => {}); });
describe('birthday experience', () => {
  it('opens every slice with its matching friend and flavor', async () => {
    render(<App/>); fireEvent.click(screen.getByText('Explore your cake'));
    for (const s of birthday.slices) expect(screen.queryByText(s.friend, { exact: true })).toBeNull();
    for (const s of birthday.slices) {
      fireEvent.click(screen.getByRole('button',{name:new RegExp(s.flavor)}));
      expect(screen.getByRole('heading',{name:s.flavor})).toBeTruthy();
      expect(screen.getByText(s.friend,{selector:'strong'})).toBeTruthy();
      fireEvent.click(screen.getByRole('button',{name:'Close video'}));
    }
    expect(birthday.slices).toHaveLength(9);
    expect(new Set(birthday.slices.map(s => s.id)).size).toBe(9);
    await waitFor(() => expect(screen.queryByRole('region',{name:'Earl Grey tart'})).toBeNull());
  });
  it('handles missing, failed, finished and replaced videos, pausing on replacement and unmount', () => {
    const ended = vi.fn();
    const {rerender,container,unmount} = render(<VideoPlayer src="" label="test" onEnded={ended}/>);
    expect(screen.getByText('VIDEO PLACEHOLDER')).toBeTruthy();
    rerender(<VideoPlayer src="/one.mp4" label="test" onEnded={ended}/>);
    fireEvent.ended(container.querySelector('video')!); expect(ended).toHaveBeenCalledOnce();
    rerender(<VideoPlayer src="/two.mp4" label="test" onEnded={ended}/>);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    fireEvent.error(container.querySelector('video')!); expect(screen.getByText('VIDEO UNAVAILABLE')).toBeTruthy();
    fireEvent.click(screen.getByText('Try again')); expect(container.querySelector('video')).toBeTruthy();
    unmount(); expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
  it('restores watched markers and resets them for rehearsal', () => {
    localStorage.setItem('nine-slices-watched-v1',JSON.stringify(['red-velvet']));
    render(<App/>); fireEvent.click(screen.getByText('Explore your cake'));
    expect(screen.getByText('1 of 9 stories watched')).toBeTruthy();
    fireEvent.click(screen.getByText('Reset watched stories'));
    expect(screen.getByText('0 of 9 stories watched')).toBeTruthy();
  });
  it('marks completed video and pauses when closing its panel', () => {
    const original = birthday.slices[0].video;
    birthday.slices[0].video = '/videos/test.mp4';
    try {
      const { container } = render(<App/>);
      fireEvent.click(screen.getByText('Explore your cake'));
      fireEvent.click(screen.getByRole('button',{name:/Red velvet/}));
      fireEvent.ended(container.querySelector('video')!);
      expect(screen.getByText('1 of 9 stories watched')).toBeTruthy();
      expect(JSON.parse(localStorage.getItem('nine-slices-watched-v1')!)).toEqual(['red-velvet']);
      fireEvent.click(screen.getByRole('button',{name:'Close video'}));
      expect(container.querySelector('video')).toBeNull();
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    } finally { birthday.slices[0].video = original; }
  });
});
