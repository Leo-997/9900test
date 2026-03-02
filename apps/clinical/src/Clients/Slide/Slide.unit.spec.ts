import { Knex } from "knex";
import { SlideClient } from "./Slide.client";


jest.mock('knex');
jest.mock('uuid', () => ({
  v4: () => 'test-id',
}));
jest
  .useFakeTimers()
  .setSystemTime(new Date('2020-01-01'));

describe('Slide', () => {
  const user = {
    "id": "test-user-id",
    "azureId": "test-azure-id",
    "givenName": "Test",
    "familyName": "User",
    "uniqueName": "test-unique-name",
    "email": "test-email",
    "avatar": "",
  };
  const slide = {
    "index": 0,
    "title": "test-title",
    "description": "test-description",
    "alterations": []
  };
  const updatedSlide = {
    "index": 5,
    "title": "updated-test-title",
    "description": "updated-test-description"
  };
  const updatedSlideOrders = [
    {
      "id": "test-id",
      "index": 4,
    },
    {
      "id": "test-id2",
      "index": 7,
    },
  ];
  const knexFn = jest.fn(() => mockKnex);
  const mockKnex = ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue({
      "id": "test-id",
      "index": 0,
      "title": "test-title",
      "description": "test-description",
      "alterations": []
    }),
    orderBy: jest.fn().mockResolvedValue([
      {
        "id": "test-id",
        "index": 0,
        "title": "test-title",
        "description": "test-description",
        "alterations": []
      },
      {
        "id": "test-id2",
        "index": 1,
        "title": "test-title2",
        "description": "test-description2",
        "alterations": []
      },
    ]),
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    fn: {
      now: () => new Date('2020-01-01')
    },
    innerJoin: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    raw: jest.fn().mockReturnThis(),
  } as unknown ) as Knex;
  const slideClient = new SlideClient((mockKnex as unknown) as Knex);



  /* UNIT TESTS */


  // Test get slides
  it('getSlides', async () => {
    const actual = await slideClient.getSlidesByVersionId("1");
    expect(actual).toEqual([
      {
        "id": "test-id",
        "index": 0,
        "title": "test-title",
        "description": "test-description",
        "alterations": []
      },
      {
        "id": "test-id2",
        "index": 1,
        "title": "test-title2",
        "description": "test-description2",
        "alterations": []
      },
    ]);
    expect(mockKnex.from).toBeCalledWith({"s": "zcc_clinical_slides"});
    expect(mockKnex.orderBy).toBeCalledWith("s.index asc");
  });

  // Test get slide by id
  it('getSlideById', async () => {
    const actual = await slideClient.getSlideById('test-id');
    expect(actual).toEqual({
      "id": "test-id",
      "index": 0,
      "title": "test-title",
      "description": "test-description",
      "alterations": []
    });
    expect(mockKnex.from).toBeCalledWith({"s": "zcc_clinical_slides"});
    expect(mockKnex.where).toBeCalledWith("s.id", "test-id");
    expect(mockKnex.first).toBeCalled();
  });

  // Test create slide
  it('createSlide', async () => {
    const actual = await slideClient.createSlide("1", {
      ...slide,
      slideNote: "",
      alterations: []
    }, user);
    expect(actual).toEqual('test-id');
    expect(mockKnex.insert).toBeCalledWith({
      id: 'test-id',
      index: slide.index,
      title: slide.title,
      description: slide.description,
      alterations: slide.alterations,
      created_by: user.id,
      updated_by: user.id,
    });
  });

  // Test update slide
  it('updateSlide', async () => {
    const actual = await slideClient.updateSlide('test-id', updatedSlide, user);
    expect(actual).toEqual(undefined);
    expect(mockKnex.where).toBeCalledWith("id", 'test-id');
    expect(mockKnex.update).toBeCalledWith({
      index: updatedSlide.index,
      title: updatedSlide.title,
      description: updatedSlide.description,
      updated_at: new Date(),
      updated_by: user.id,
    });
  });

  // Test update slide order
  it('updateSlideOrder', async () => {
    const actual = await slideClient.updateSlideOrder({ data: updatedSlideOrders}, user);
    expect(actual).toEqual(undefined);
    expect(mockKnex.where).toBeCalledWith("id", 'test-id');
    expect(mockKnex.update).toBeCalledWith({
      index: 4,
      updated_at: new Date(),
      updated_by: user.id,
    });
  });

  // Test delete slide order
  it('deleteSlide', async () => {
    const actual = await slideClient.deleteSlide('test-id', user);
    expect(actual).toEqual(undefined);
    expect(mockKnex.update).toBeCalledWith({
      deleted_at: new Date(),
      deleted_by: user.id,
    });
    expect(mockKnex.where).toBeCalledWith("id", 'test-id');
    expect(mockKnex.from).toBeCalledWith("zcc_clinical_slides");
  });
})