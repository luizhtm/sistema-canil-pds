import React, { Component } from 'react'
import styles from 'styled-components'
import { Link } from 'react-router-dom'

import { TextField, MenuItem } from '@material-ui/core'
import { LoadingButton } from '@material-ui/lab'
import Header from '../components/Header'
import Box from '../components/Box'
import SearchIcon from '@material-ui/icons/Search'

import { SearchPet } from '../api/PetController'
import BREEDS from '../assets/breeds.json'
import GENDERS from '../assets/genders_pet.json'
import StatusBox from '../components/StatusBox'
import { IsLogged } from '../api/AccountController'

const Main = styles.main`
  //background-color: red;
  min-height: 100%;
  //background-image: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%);
  //min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
`

const Menu = styles.div`
  display: flex;
  width: 1000px;
  margin: 0 auto;
  flex-direction: column;
  //background: pink;
  place-content: center;

  h3 {
    margin-bottom: 0;
  }

  div.fields {
    display: flex;
    flex-direction: row;
    align-items: center;

    > * {
      margin: 0 20px;
      width: 90%;

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }
    }

    .MuiInputBase-inputMultiline {
      min-height: 66px;
    }
  }

  .search-button {
    text-align: center;
    margin-top: 20px;
    margin-right: 20px;
  }

  table.results {
    margin-top: 20px;
    border-collapse: collapse;

    tr {
      background: rgba(0, 0, 0, 0.10);
      text-align: left;

      &:nth-child(even) {
        background: rgba(0, 0, 0, 0.03);
      }
    }

    th, td {
      padding: 8px;
      border: 1px solid rgba(0, 0, 0, 0.4);

      a {
        color: var(--white);
      }
    }
  }
`

export default class SearchPetForm extends Component {
  constructor(props) {
    super(props)

    this.initial_state = {
      // PET search fields
      name: '',
      breed: '',
      gender: '',

      // component-related stuff
      results: [],
      loading: false,
      success: false,
      err: false,
    }
    this.state = { ...this.initial_state }
  }

  async componentDidMount() {
    if (!IsLogged())
      return this.props.history.push('/login')

    await this.search()
  }

  reset() {
    this.setState({ ...this.initial_state })
  }

  async search() {
    this.setState({ loading: true, err: false, success: false })
    const { name, breed, gender } = this.state
    let results = await SearchPet({ name, breed, gender })
    const err = results.length ? false : 'Nenhum resultado encontrado'
    this.setState({ loading: false, results, err, success: !err })
  }

  render() {
    return (
      <Main>
        <Header/>

        <Box>
          <Menu>
            <span>&#8592; <Link to='/' style={{ color: 'var(--white)' }}>Voltar</Link></span>
            <h3>Buscar PET</h3>
            <br />

            <div className='fields'>

              <TextField label='Nome' variant='outlined' value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} />

              <TextField select label='Sexo' variant='outlined' value={this.state.gender} onChange={(e) => this.setState({ gender: e.target.value })} >
                <MenuItem key='' value='' style={{ color: 'black' }}>Não Selecionado</MenuItem>
                { GENDERS.map((label) => <MenuItem key={label} value={label} style={{ color: 'black', ...this.state.gender === label ? { background: '#9e9e9e', fontWeight: 'bold' } : {} }}>{ label }</MenuItem>) }
              </TextField>

              <TextField select label='Raça' variant='outlined' value={this.state.breed} onChange={(e) => this.setState({ breed: e.target.value })} >
                <MenuItem key='' value='' style={{ color: 'black' }}>Não Selecionado</MenuItem>
                { BREEDS.map((label) => <MenuItem key={label} value={label} style={{ color: 'black', ...this.state.breed === label ? { background: '#9e9e9e', fontWeight: 'bold' } : {} }}>{ label }</MenuItem>) }
              </TextField>
            </div>

            <div className='search-button'>
              <LoadingButton disabled={ this.state.loading } onClick={ () => this.search() } variant='contained' pending={ this.state.loading } pendingPosition='center' startIcon={<SearchIcon />}>Buscar</LoadingButton>
            </div>

            <StatusBox err={this.state.err} />
          </Menu>
        </Box>

        <Box hidden={this.state.results.length <= 0}>
          <Menu>
            <table className='results'>
              <tbody>
                <tr><th>Nome</th><th>Dono</th><th>Sexo</th><th>Raça</th></tr>
                { this.state.results.map((e) => <tr key={e.id}><td><Link to={`/pet-timeline/${e.id}`}>{e.name}</Link></td><td><Link to={`/owner/${e.owner.id}`}>{e.owner.name} ({e.owner.cpf})</Link></td><td>{e.gender}</td><td>{e.breed}</td></tr>) }
              </tbody>
            </table>
          </Menu>
        </Box>
      </Main>
    )
  }
}
