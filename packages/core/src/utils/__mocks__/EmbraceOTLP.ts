import {OTLPExporterConfig} from "../../interfaces";

const mockEmbraceOTLPGet = jest.fn().mockReturnValue({
  initialize: jest.fn().mockResolvedValue(true),
});
const mockEmbraceOTLPSet = jest.fn().mockResolvedValue(undefined);

const EmbraceOTLPMock = jest.fn().mockImplementation(() => {
  return {
    get: mockEmbraceOTLPGet,
    set: (exporters: OTLPExporterConfig) => mockEmbraceOTLPSet(exporters),
  };
});

export default EmbraceOTLPMock;
