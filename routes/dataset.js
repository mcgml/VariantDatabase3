'use strict';

module.exports = function(app, auth, request){
    app.get('/api/variantdatabase/dataset/qc/passed', auth, function(req, res) {
        request.get (
            {
                uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/dataset/qc/passed",
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
    app.get('/api/variantdatabase/dataset/qc/pending', auth, function(req, res) {
        request.get (
            {
                uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/dataset/qc/pending",
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
    app.post('/api/variantdatabase/dataset/qc/add', auth, function(req, res) {
        request.post(
            {
                uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/dataset/qc/add",
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
    app.get('/api/variantdatabase/dataset/qc/pending/auth', auth, function(req, res) {
        request.get (
            {
                uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/dataset/qc/pending/auth",
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