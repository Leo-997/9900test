import type { CurationAtlasNote, GetCurationAtlasNotesFilterDTO, UpdateCurationAtlasNoteDTO } from '@zero-dash/types';
import type { AxiosInstance } from 'axios';

export interface ICurationAtlasClient {
  getAtlasNotes: (query: GetCurationAtlasNotesFilterDTO) => Promise<CurationAtlasNote[]>;
  upsertAtlasNote: (note: UpdateCurationAtlasNoteDTO) => Promise<void>;
}

export const createCurationAtlasClient = (axios: AxiosInstance): ICurationAtlasClient => {
  async function getAtlasNotes(
    query: GetCurationAtlasNotesFilterDTO,
  ): Promise<CurationAtlasNote[]> {
    const resp = await axios.get('/curation-atlas-notes', { params: query });
    return resp.data;
  }

  async function upsertAtlasNote(note: UpdateCurationAtlasNoteDTO): Promise<void> {
    await axios.patch('/curation-atlas-notes', note);
  }

  return {
    getAtlasNotes,
    upsertAtlasNote,
  };
};
