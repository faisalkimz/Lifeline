// Theme slice for light/dark mode management
const THEME_KEY = 'lahhr-theme';

const initialState = {
  mode: localStorage.getItem(THEME_KEY) || 'light'
};

// Action types
const TOGGLE_THEME = 'theme/toggle';
const SET_THEME = 'theme/set';

// Action creators
export const toggleTheme = () => ({
  type: TOGGLE_THEME
});

export const setTheme = (mode) => ({
  type: SET_THEME,
  payload: mode
});

// Selector
export const selectTheme = (state) => state.theme.mode;

// Reducer
export default function themeReducer(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_THEME:
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, newMode);
      return { ...state, mode: newMode };

    case SET_THEME:
      localStorage.setItem(THEME_KEY, action.payload);
      return { ...state, mode: action.payload };

    default:
      return state;
  }
}
