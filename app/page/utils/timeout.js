// Promise 风格的 setTimeout

export default function() {
  let res
  const p = new Promise(r => {
    res = r
  })

  const handle = setTimeout(res, ...arguments)
  p.stop = () => clearTimeout(handle)

  return p
}
