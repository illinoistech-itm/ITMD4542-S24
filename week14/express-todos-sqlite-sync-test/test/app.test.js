const app = require('../app');
const request = require('supertest');

describe('Test the root path.', ()=>{
    it('Root - It should respond to a GET request with a 200.', async ()=>{
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

    it('Root - It should respond to a GET request with a 200 and HTML content.', async ()=>{
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.header['content-type']).toMatch(/html/);
        expect(response.text).toMatch(/<h1>Express<\/h1>/);
    });

    it('It should respond to a GET request with a 404 on a path that does not exist', async ()=>{
        const response = await request(app).get('/nope');
        expect(response.status).toBe(404);
    });
});