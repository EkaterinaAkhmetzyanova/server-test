const http = require('http');
const uuid = require('uuid');
const Koa = require('koa');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const app = new Koa();


// app.use(
//   cors({
//     origin: '*',
//     credentials: true,
//     'Access-Control-Allow-Origin': true,
//     allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
//   })
// );

const tickets = [];

class Tickets {
  constructor(id, name, description, status, created) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.status = status;
    this.created = created;
  }
}

const firstTicket = new Tickets(uuid.v4(), 'to finilize the agreement', 'to revise clause 4', false, new Date());
tickets.push(firstTicket);

app.use(koaBody({
    urlencoded: true,
    multipart: true,
    text: true,
    json: true,
}));

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method === 'OPTIONS') {
    ctx.response.set({...headers});
}

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});


  app.use(async ctx => {
    ctx.response.set({
      'Access-Control-Allow-Origin': '*',
      });
      const { method,id } = ctx.request.query;
      const { name, description } = ctx.request.body;
      // method ? method : method = ctx.request.body.method;
      switch (method) {
        case 'allTickets':
          ctx.response.body = tickets.map((item) => {
            return {
              id: item.id,
              name: item.name,
              status: item.status,
              created: item.created,
            };
          });
          return;
        // TODO: ?????????????????? ?????????????????? ??????????????
        case 'ticketById':
          // const { id } = ctx.request.query;
          if (id) {
            const ticket = tickets.find((item) => item.id === id);
            if (ticket) {
              ctx.response.body = ticket;
            } else {
              ctx.response.status = 404;
            }
          }
          return;
        case 'createTicket':
          //const { name, description } = ctx.request.body;
          const newId = uuid.v4();
          const created = new Date();
          tickets.push(new Tickets(newId, name, description, false, created));
          ctx.response.body = tickets;
        return;
        case 'removeById':
          // const { delId } = ctx.request.query;
          const index = tickets.findIndex((item) => item.id === id);
          tickets.splice(index, 1);
          ctx.response.body = true;
          return;
        case 'editTicket':
          // if (ctx.request.query.id) {
          //   const { edName, edDescription } = ctx.request.body;
          //   const edId = Number(ctx.request.query.id);
          //   console.log(edId);
          //   for (const item of tickets) {
          //     if (edId === item.id) {
          //       item.name = edName;
          //       item.description = edDescription;
          //     }
          //   }
          // }
          if (id) {
            const index = tickets.findIndex((item) => item.id === id);
            tickets[index].name = name;
            tickets[index].description = description;

          }
          ctx.response.body = true;
        return;
          default:
          ctx.response.status = 404;
          return;
      }
  });

const server = http.createServer(app.callback());
const port = process.env.PORT || 8080;
server.listen(port, () => console.log('Server started'));