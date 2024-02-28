/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const github = require('@actions/github')
const editJsonFile = require('edit-json-file')

const main = require('../src/main')

const infoMock = jest.spyOn(core, 'info').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const runMock = jest.spyOn(main, 'run')

jest.mock('@actions/github')
jest.mock('edit-json-file')
jest.mock('@actions/exec', () => ({
  ...jest.requireActual('@actions/exec'),
  exec: jest.fn()
}))

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return and skip if is not a release branch', async () => {
    const mockContext = {
      ref: 'refs/heads/feat/1.2.3',
      payload: {
        pusher: {
          name: 'test',
          email: ''
        }
      }
    }

    github.context = mockContext

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      'Not on release branch, skipping version bump.'
    )
  })

  it('should return and skip bump if the versions are the same', async () => {
    const mockContext = {
      ref: 'refs/heads/release/1.2.3',
      payload: {
        pusher: {
          name: 'test',
          email: ''
        }
      }
    }

    github.context = mockContext

    editJsonFile.mockReturnValue({
      get: jest.fn().mockReturnValue('1.2.3')
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      'Version already set, skipping bump.'
    )
  })

  it('should fail if cannot determine the version from the branch name', async () => {
    const mockContext = {
      ref: 'refs/heads/releases/foo',
      payload: {
        pusher: {
          name: 'test',
          email: ''
        }
      }
    }

    github.context = mockContext

    await main.run()
    expect(runMock).toHaveReturned()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Could not determine version from branch name'
    )
  })

  it('should update package version with the version from the branch name', async () => {
    const mockContext = {
      ref: 'refs/heads/release/1.2.3',
      payload: {
        pusher: {
          name: 'test',
          email: ''
        }
      }
    }

    github.context = mockContext

    const setMock = jest.fn()
    const saveMock = jest.fn()
    editJsonFile.mockReturnValue({
      get: jest.fn().mockReturnValue('1.2.2'),
      set: setMock,
      save: saveMock
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(setMock).toHaveBeenCalledWith('version', '1.2.3')
    expect(saveMock).toHaveBeenCalledTimes(1)
  })
})
