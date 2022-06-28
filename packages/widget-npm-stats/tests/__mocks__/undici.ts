export const request = jest.fn().mockResolvedValue({
  statusCode: 200,
  body: {
    json: jest.fn().mockResolvedValue({
      foo: {
        '2022-06-26': 45142,
        '2022-06-27': 169454
      },
      bar: {
        '2022-02-01': 33334,
        '2022-02-02': 31277
      }
    })
  }
})
