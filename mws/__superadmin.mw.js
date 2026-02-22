module.exports = ({ managers }) => {
    return ({ req, res, next, results }) => {
        const auth = results.__auth;

        if (!auth || auth.role !== 'superadmin') {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                errors: 'Superadmin access required'
            });
        }

        next(auth);
    };
};
