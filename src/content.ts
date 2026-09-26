export type Appearance = { sponge: string; filling: string; frosting: string; topping: 'berries' | 'nuts' | 'petals' | 'chocolate' | 'lemon'; accent: string };
export type Slice = { id: string; friend: string; flavor: string; video: string; poster?: string; appearance: Appearance };
const slice = (id: string, flavor: string, friend: string, video: string, sponge: string, filling: string, frosting: string, topping: Appearance['topping'], accent: string): Slice => ({ id, flavor, friend, video, appearance: { sponge, filling, frosting, topping, accent } });
export const birthday = {
  recipient: 'you', // Replace with her name.
  intro: { video: '/videos/intro.mp4', poster: undefined as string | undefined },
  slices: [
    slice('red-velvet', 'Red velvet', 'Diya', '/videos/red-velvet-diya.mp4', '#882f35', '#f7e5ce', '#f7e5ce', 'berries', '#a52c3c'),
    slice('hazelnut-chocolate', 'Hazelnut chocolate', 'Archana', '/videos/hazelnut-chocolate-archana.mp4', '#4b2c22', '#916043', '#623b2b', 'nuts', '#c6a16a'),
    slice('mango-passion', 'Mango passion', 'Paawni', '/videos/mango-passion-paawni.mp4', '#d8a84f', '#f2b83e', '#f5c84c', 'lemon', '#ef9c22'),
    slice('biscoff-cookie', 'Biscoff cookie cake', 'Samarth', '/videos/biscoff-cookie-samarth.mp4', '#a6693f', '#c88954', '#a96a43', 'chocolate', '#c47b42'),
    slice('almond-fudge', 'Choco almond cake', 'Swarnima', '/videos/almond-fudge-swarnima.mp4', '#42261f', '#9b654d', '#513027', 'nuts', '#bc9066'),
    slice('white-chocolate-raspberry', 'White chocolate raspberry cheesecake', 'Adaa', '/videos/white-chocolate-raspberry-adaa.mp4', '#d9bd96', '#b84c67', '#f1e4d8', 'berries', '#b5435f'),
    slice('tiramisu', 'Tiramisu', 'Mishthi', '/videos/tiramisu-mishthi.mp4', '#9a633f', '#e6d2b9', '#d7b99c', 'chocolate', '#6c412d'),
    slice('brownie-chocolate', 'Brownie chocolate', 'Manaswini', '/videos/brownie-chocolate-manaswini.mp4', '#3b211b', '#75442f', '#48291f', 'chocolate', '#321915'),
    slice('earl-grey-tart', 'Earl Grey tart', 'Grace', '/videos/earl-grey-tart-grace.mp4', '#c6a77d', '#e9e0d0', '#eee7dc', 'petals', '#66728b'),
  ] satisfies Slice[],
};
