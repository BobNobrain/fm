import createApp from './server';

createApp()
    .then(app => app.listen(3000))
    .catch(err => {
        console.error('FATAL');
        console.error(err);
        process.exit(1);
    });
