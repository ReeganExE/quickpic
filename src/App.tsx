import styled, { StyleSheetManager } from 'styled-components'

import Home from './Home'

const StyledContainer = styled.div`
  padding: 2px;
`

function App(): JSX.Element {
  return (
    <StyleSheetManager>
      <StyledContainer>
        <Home />
      </StyledContainer>
    </StyleSheetManager>
  )
}

export default App
