export type Appearance = { sponge: string; filling: string; frosting: string; topping: 'berries' | 'nuts' | 'petals' | 'chocolate' | 'lemon'; accent: string };
export type Slice = { id: string; friend: string; flavor: string; video: string; poster?: string; appearance: Appearance };
const slice = (id: string, flavor: string, sponge: string, filling: string, frosting: string, topping: Appearance['topping'], accent: string, index: number): Slice => ({ id, flavor, friend: `Friend ${index}`, video: '', appearance: { sponge, filling, frosting, topping, accent } });
export const birthday = {
  recipient: 'you', // Replace with her name.
  intro: { video: '', poster: undefined as string | undefined },
  slices: [
    slice('red-velvet', 'Red velvet', '#882f35', '#f7e5ce', '#f7e5ce', 'berries', '#a52c3c', 1),
    slice('nutty-chocolate', 'Nutty chocolate', '#4b2c22', '#916043', '#623b2b', 'nuts', '#c6a16a', 2),
    slice('strawberry', 'Strawberry cream', '#dcb785', '#e7a2a2', '#f5d5ce', 'berries', '#c4484e', 3),
    slice('pistachio', 'Pistachio', '#b0b679', '#eee3c5', '#ccd19a', 'nuts', '#74814d', 4),
    slice('lemon', 'Lemon cloud', '#e2c58d', '#fbefcf', '#f6e7b3', 'lemon', '#ecc858', 5),
    slice('dark-chocolate', 'Dark chocolate', '#42281f', '#a16d52', '#4f3028', 'chocolate', '#382018', 6),
    slice('vanilla', 'Vanilla bean', '#d0a474', '#fbebd5', '#f7e9d4', 'petals', '#d1ad87', 7),
    slice('raspberry', 'Raspberry rose', '#d8ae88', '#b86173', '#e5b2b4', 'petals', '#a94460', 8),
    slice('blueberry', 'Blueberry cheesecake', '#bc976f', '#ece0db', '#c6b6d0', 'berries', '#504465', 9),
  ] satisfies Slice[],
};
