import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import type { Pollution } from '../models/pollution';
import { PollutionService } from '../services/pollution.service';
import { DeletePollution, LoadPollutions } from './pollutions.actions';

export interface PollutionsStateModel {
  items: Pollution[];
  loading: boolean;
  error: string;
  deleting: boolean;
  deleteError: string;
  deleteSuccess: string;
}

@State<PollutionsStateModel>({
  name: 'pollutions',
  defaults: {
    items: [],
    loading: false,
    error: '',
    deleting: false,
    deleteError: '',
    deleteSuccess: '',
  },
})
@Injectable()
export class PollutionsState {
  private readonly pollutionService = inject(PollutionService);

  @Selector()
  static items(state: PollutionsStateModel): Pollution[] {
    return state.items;
  }

  @Selector()
  static loading(state: PollutionsStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: PollutionsStateModel): string {
    return state.error;
  }

  @Selector()
  static deleting(state: PollutionsStateModel): boolean {
    return state.deleting;
  }

  @Selector()
  static deleteError(state: PollutionsStateModel): string {
    return state.deleteError;
  }

  @Selector()
  static deleteSuccess(state: PollutionsStateModel): string {
    return state.deleteSuccess;
  }

  @Action(LoadPollutions)
  load(ctx: StateContext<PollutionsStateModel>) {
    ctx.patchState({ loading: true, error: '' });

    return this.pollutionService.list().pipe(
      tap((items) => ctx.patchState({ items })),
      catchError((error: unknown) => {
        ctx.patchState({ error: this.pollutionService.getErrorMessage(error) });
        return EMPTY;
      }),
      finalize(() => ctx.patchState({ loading: false })),
    );
  }

  @Action(DeletePollution)
  delete(ctx: StateContext<PollutionsStateModel>, action: DeletePollution) {
    if (action.id === undefined) {
      ctx.patchState({
        deleteError: 'Impossible de supprimer cette pollution sans identifiant.',
      });
      return EMPTY;
    }

    ctx.patchState({
      deleting: true,
      deleteError: '',
      deleteSuccess: '',
    });

    return this.pollutionService.delete(action.id).pipe(
      tap(() => {
        ctx.patchState({
          items: ctx.getState().items.filter((item) => item.id !== action.id),
          deleteSuccess: 'La pollution a été supprimée.',
        });
      }),
      catchError((error: unknown) => {
        ctx.patchState({
          deleteError: this.pollutionService.getErrorMessage(error),
        });
        return EMPTY;
      }),
      finalize(() => ctx.patchState({ deleting: false })),
    );
  }
}
