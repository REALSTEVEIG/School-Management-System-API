module.exports = ({ config, managers }) => {
    return ({ req, res, next }) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'Authorization token required'
            });
        }

        const token = authHeader.split(' ')[1];

        let decoded = null;
        try {
            decoded = managers.token.verifyLongToken({ token });
            if (!decoded) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    errors: 'Invalid or expired token'
                });
            }
        } catch (err) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'Invalid or expired token'
            });
        }

        next(decoded);
    };
};
