const app = require('../app');
const request = require('supertest');

describe('Test the todos routes.', ()=>{
    it('GET /todos should respond with a 200 and specific paragraph content.', async ()=>{
        const response = await request(app).get('/todos');
        expect(response.status).toBe(200);
        expect(response.header['content-type']).toMatch(/html/);
        expect(response.text).toMatch(/<p>Welcome to Express Todos<\/p>/);
    });

    it('GET /todos/add should respond with a 200 and the add todo form.', async ()=>{
        const response = await request(app).get('/todos/add');
        expect(response.status).toBe(200);
        expect(response.header['content-type']).toMatch(/html/);
        expect(response.text).toMatch(/<form method="POST" action="\/todos\/add">/);
    });

    it('POST /todos/add should add entry to database and redirect', async ()=>{
        const response = await request(app).post('/todos/add')
            .send('todoText=JestTest')
            .send('todoEmail=f@f.com');
        expect(response.status).toBe(302);
        expect(response.header['location']).toMatch(/\/todos/);
    });
});