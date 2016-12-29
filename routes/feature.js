'use strict';

module.exports = function(app, auth, request){
    app.post('/api/variantdatabase/feature/info', auth, function(req, res) {
        request.post(
            {
                uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/feature/info",
                json: req.body
            },
            function(error, result)
            {
                if (error) throw err;
                if (result.statusCode != 200) {
                    res.status(result.statusCode).send(result.body);
                } else {
                    res.send(result.body);
                }
            }
        )
    });
    app.post('/api/variantdatabase/feature/preference/add', auth, function(req, res) {
        request.post(
            {
                uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/feature/preference/add",
                json: req.body
            },
            function(error, result)
            {
                if (error) throw err;
                if (result.statusCode != 200) {
                    res.status(result.statusCode).send(result.body);
                } else {
                    res.send(result.body);
                }
            }
        )
    });
    app.get('/api/variantdatabase/feature/preference/pending/auth', auth, function(req, res) {
        request.get (
            {
                uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/feature/preference/pending/auth",
                json: req.body
            },
            function(error, result)
            {
                if (error) throw err;
                if (result.statusCode != 200) {
                    res.status(result.statusCode).send(result.body);
                } else {
                    res.send(result.body);
                }
            }
        )
    });
};