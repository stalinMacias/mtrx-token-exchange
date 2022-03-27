import { createStore, applyMiddleware, compose } from 'redux'
// Importing the rootReducers that wraps up all the reducer for the application
import rootReducer from './reducers'
import { createLogger } from 'redux-logger';

const loggerMiddleware = createLogger();
const middleware = [];

// For redux dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function configureStore(preloadedState) {
    return createStore(
        rootReducer,
        preloadedState,
        composeEnhancers(applyMiddleware(...middleware,loggerMiddleware))
    )
}