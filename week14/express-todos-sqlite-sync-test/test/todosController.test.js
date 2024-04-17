const todosRepo = require('../src/todosSQLiteRepository');
const { todos_detail } = require('../controllers/todosController');
const { redirect } = require('express/lib/response');

jest.mock('../src/todosSQLiteRepository');

const req = {
    params: {
        uuid: 250
    }
};

const res = {
    render: jest.fn((x) => x),
    redirect: jest.fn((x) => x)
}

describe('Test todosController methods', ()=>{
    it('GET single todos should return call to render function', ()=>{
        todosRepo.findById.mockImplementationOnce(() => ({
            id: 250,
            text: 'mocked todo text for 250'
        }));
        todos_detail(req, res);
        expect(res.render).toHaveBeenCalledWith('todo', { title: 'Your Todo', todo: { id: 250, text: 'mocked todo text for 250'}} );
    });

    it('GET single todo not found should send a redirect.', () => {
        todosRepo.findById.mockImplementationOnce(() => null);
        todos_detail(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/todos');
    });
});