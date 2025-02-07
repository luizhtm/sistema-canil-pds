import React, { Component } from 'react'
import styles from 'styled-components'
import { Link } from 'react-router-dom'

import { TextField, MenuItem } from '@material-ui/core'

import { LoadingButton } from '@material-ui/lab'

import ReactMarkdown from 'react-markdown'

import Header from '../components/Header'
import Box from '../components/Box'
import StatusBox from '../components/StatusBox'
import AddIcon from '@material-ui/icons/Add'
import Divider from '@material-ui/core/Divider'

import dateFormat from '../dateFormat'

import { AddFinance, GetAllFinance } from '../api/FinanceController'
import { IsLogged } from '../api/AccountController'
import { can } from '../api/authenticate'

const Main = styles.main`
  //background-color: red;
  min-height: 100%;
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
    flex-direction: column;
    align-items: center;

    > * {
      margin-top: 0;
      margin-bottom: 20px;
    }

    > *:not(:last-child) {
      width: 90%;
    }

    .MuiInputBase-inputMultiline {
      min-height: 66px;
    }
  }

  div.text {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: left;

    > *:not(:last-child) {
      margin-right: 20px;
    }
    > *:last-child {
      flex: 1;
    }
  }

  .confirm-button {
    background-color: #32CD32;
    &:hover {
      background-color: #228B22;
    }
  }

  table.finance {
    margin-top: 20px;
    border-collapse: collapse;

    tr {
      text-align: left;

      &:first-child {
        background: rgba(0, 0, 0, 0.10);
      }

      &:not(:first-child,:last-child) {
        //border-bottom: solid white 2px;
      }

      &.entrada {
        background: var(--success);
      }

      &.saida {
        background: #c00;
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

export default class Finance extends Component {
  constructor(props) {
    super(props)

    this.initial_state = {
      // Owner fields
      amount: 1,
      description: '',
      type: '',
      balance: 0,
      events: [],

      // component-related stuff
      loading: false,
      success: false,
      err: false,
    }
    this.state = { ...this.initial_state }
  }

  async componentDidMount() {
    if (!IsLogged())
      return this.props.history.push('/login')

    if (!can().readAny('finance').granted) return

    this.setState({ loading: true })
    let finance_data = await GetAllFinance()

    this.setState({ ...finance_data, loading: false })
  }

  reset() {
    this.setState({ ...this.initial_state })
  }

  async submit() {
    let l = Array.from(document.getElementsByTagName('input'))
    for (let i of l) {
      i.oninput = (e) => e.target.setCustomValidity('')

      if (!i.checkValidity())
        return i.reportValidity()
    }

    if (this.state.type === 'Saída')
      this.state.amount *= -1

    let new_event = {
      amount: Number(this.state.amount),
      description: this.state.description,
      date: new Date().toISOString(),
    }
    new_event.id = new_event.date
    let events = [ new_event ,...this.state.events]

    this.setState({ loading: true, err: false, success: false })
    let { err } = await AddFinance({ amount: this.state.amount, description: this.state.description })
    this.setState({ amount: 0, description: '', type: '', balance: this.state.balance + Number(this.state.amount), events, loading: false, err, success: !err })
  }

  render() {
    return (
      <Main>
        <Header/>

        <Box>
          <Menu>
            <span>&#8592; <Link to='/' style={{ color: 'var(--white)' }}>Voltar</Link></span>
            <h3>Finanças</h3>

            <StatusBox err={this.state.err} success={this.state.success} />

            <div className='fields'>
              <div className='text'>
                <TextField style={{ width: '450px' }} select label='Tipo' variant='outlined' value={this.state.type} onChange={(e) => this.setState({ type: e.target.value })} required >
                  {['Entrada', 'Saída'].map((label) => <MenuItem key={label} value={label} style={{ color: 'black', ...this.state.type === label ? { background: '#9e9e9e', fontWeight: 'bold' } : {} }}>{ label }</MenuItem>) }
                </TextField>

                <TextField label='Valor' variant='outlined' value={this.state.amount} inputProps={{ min: 1, step: '0.01' }} type='number' onChange={(e) => this.setState({ amount: e.target.value })} required />
              </div>

              <TextField label='Descrição' variant='outlined' value={this.state.description} onChange={(e) => this.setState({ description: e.target.value })} required />

              <LoadingButton className='confirm-button' disabled={ this.state.loading } onClick={ () => this.submit() } variant='contained' pending={ this.state.loading } pendingPosition='center' startIcon={<AddIcon />}>Adicionar</LoadingButton>
            </div>
          </Menu>
        </Box>

        <Box hidden={!can().readAny('finance').granted}>
          <Menu>
            <h3>Balanço: R$ {this.state.balance}</h3>
            <Divider style={{ marginTop: '15px', background: '#C0C0C0' }} />
            <h3>Eventos</h3>
            <span hidden={this.state.events.length > 0}>Não foram encontrados eventos</span>
            <table className='finance' hidden={this.state.events.length <= 0}>
              <tbody>
                <tr><th>Valor</th><th>Descrição</th><th>Data</th></tr>
                { this.state.events.map((e) => <tr className={e.amount > 0 ? 'entrada' : 'saida'} key={e.id}><td>R$&nbsp;{e.amount}</td><td style={{ width: '350px' }}><ReactMarkdown components={{ a: ({ href, children }) => <Link to={href}>{children}</Link> }}>{ e.description }</ReactMarkdown></td><td>{dateFormat(e.date, 'HH:mm\xa0dd/MM/yy')}</td></tr>) }
              </tbody>
            </table>
          </Menu>
        </Box>
      </Main>
    )
  }
}
