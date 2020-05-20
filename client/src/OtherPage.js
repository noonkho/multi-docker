import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
    return (
        <div>
            I'm in some other page!
            <Link to="/">Go back to home page!</Link>
        </div>
    );
};