import React, { useMemo } from 'react'
import LinkIcon from '@mui/icons-material/Link'
import Tooltip from '@mui/material/Tooltip'
import { Link, Button, Typography, IconButton } from '@mui/material'

import { jumpTo } from '../index'
import type { ProjectItem, MarqueeWindow } from '../types'

const marqueeWindow: MarqueeWindow = window as any

const transformPathToLink = (item: ProjectItem) => {
  try {
    // transform
    // -> git@github.com/foo/bar.git#main
    // to
    // -> https://github.com/foo/bar/blob/adcbe2a5c0428783fe9d6b50a1d2e39cbbe2def6/some/file#L3
    const [path, line] = item.origin!.split(':')
    const u = new window.URL(`https://${item.gitUri!
      .replace(':', '/')
      .split('@')
      .pop()!
    }`)
    const rPath = path.replace(marqueeWindow.activeWorkspace!.path, '')
    return `${u.origin}${u.pathname.replace(/\.git$/, '')}/blob/${item.commit}${rPath}#L${parseInt(line, 10) + 1}`
  } catch (err: any) {
    console.warn(`Couldn't construct remote url: ${(err as Error).message}`)
    return undefined
  }
}

interface ProjectItemLinkParams {
  item?: ProjectItem
  iconOnly?: boolean
}

let ProjectItemLink = (props: ProjectItemLinkParams) => {
  if (!props.item) {
    return <></>
  }

  const itemLinkName = useMemo(() => {
    const path = props.item?.path || props.item?.origin || 'unknown:unknown'
    const [fileName, line] = path.split('/').pop()!.split(':')
    return `${fileName}:${parseInt(line, 10) + 1}`
  }, [props.item])

  const link = useMemo(() => {
    if (props.item?.path) {
      return props.item?.path
    }
    const useRemoteLink = props.item?.gitUri && props.item?.commit && props.item?.origin
    if (useRemoteLink && marqueeWindow.activeWorkspace) {
      return transformPathToLink(props.item!)
    }
  }, [props.item])

  if (props.item.path) {
    if (props.iconOnly) {
      return (
        <Tooltip
          style={{borderRadius: '4px'}}
          title={<Typography variant="subtitle2">{props.item.path}</Typography>}
          placement="top"
          arrow
        >
          <Typography variant="body2" noWrap>
            <IconButton aria-label="todo-link" size="small" tabIndex={-1} onClick={() => jumpTo(props.item)}>
              <LinkIcon />
            </IconButton>
          </Typography>
        </Tooltip>
      )
    }

    return (
      <Button
        size="small"
        startIcon={<LinkIcon />}
        disableFocusRipple
        onClick={() => jumpTo(props.item)}
        style={{
          padding: '0 5px',
          background: 'transparent',
          color: 'inherit'
        }}
      >
        {itemLinkName}
      </Button>
    )
  }

  if (!link) {
    return <></>
  }

  if (props.iconOnly) {
    return (
      <Tooltip
        style={{borderRadius: '4px', marginLeft: '5px'}}
        title={<Typography variant="subtitle2">{link}</Typography>}
        placement="top"
        arrow
      >
        <Typography variant="body2" noWrap>
          <Link aria-label="Project Item Link" tabIndex={-1} href={link}>
            <LinkIcon />
          </Link>
        </Typography>
      </Tooltip>
    )
  }

  return (
    <Link
      aria-label="Project Item Link"
      href={link}
      style={{
        padding: '3px 5px 0 29px',
        background: 'transparent',
        color: 'inherit',
        fontSize: '.81em',
        textDecoration: 'none',
        position: 'relative',
        display: 'block'
      }}
    >
      <LinkIcon style={{
        fontSize: '18px',
        position: 'absolute',
        top: '2px',
        left: '3px'
      }} />
      {itemLinkName}
    </Link>
  )
}

export default React.memo(ProjectItemLink)
