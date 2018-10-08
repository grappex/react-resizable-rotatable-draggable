import styled from 'styled-components'
import StyledRect from './StyledRect'

export default styled(StyledRect)`

.resizable-handler {
  width: 2.5em;
  height: 2.5em;

  &.tl,
  &.t,
  &.tr {
    top: -1.25em;
  }

  &.tl,
  &.l,
  &.bl {
    left: -0.25em;
  }

  &.bl,
  &.b,
  &.br {
    bottom: 0px;
  }

  &.br,
  &.r,
  &.tr {
    right: 0px;
  }

  &.l,
  &.r {
    margin-top: 0em;
  }

  &.t,
  &.b {
    margin-left: 0px;
  }
}
`;
