import app from './app.js'

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running @ ${process.env.SERVER_PORT}`)
})
